import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { getAdminDb } from '@/lib/firebase/admin';
import type { GeminiModelId } from '@/lib/gemini/models';

export type GeminiKeySource = 'platform' | 'byok';

export interface ByokStatus {
  enabled: boolean;
  keyLast4?: string;
  monthlyBudgetUsd: number;
  hardStop: boolean;
  estimatedMonthlySpendUsd: number;
  budgetExceeded: boolean;
}

interface EncryptedByokSecret {
  ciphertext: string;
  iv: string;
  tag: string;
  updatedAt: number;
}

interface UsageDoc {
  month: string;
  estimatedInputTokens: number;
  estimatedOutputTokens: number;
  estimatedSpendUsd: number;
  byokSpendUsd: number;
  platformSpendUsd: number;
  requestCount: number;
  featureCounts: Record<string, number>;
  updatedAt: number;
}

const DEFAULT_BUDGET_USD = 25;
const USER_DOC_COLLECTION = 'users';
const SECRET_SUBCOLLECTION = 'secrets';
const SECRET_DOC_ID = 'geminiByok';
const USAGE_SUBCOLLECTION = 'usage';

const MODEL_COST_MULTIPLIER: Record<GeminiModelId, number> = {
  'gemini-3-flash-preview': 1,
  'gemini-3-pro-preview': 4,
  'gemini-2.5-flash-native-audio-preview-12-2025': 2.5,
};

// Conservative defaults used only for on-platform estimation and budgeting.
const EST_INPUT_USD_PER_1M = 0.4;
const EST_OUTPUT_USD_PER_1M = 1.2;

export async function setUserByokSecret(uid: string, apiKey: string): Promise<{ last4: string }> {
  const secret = getEncryptionSecret();
  const last4 = apiKey.slice(-4);
  const encrypted = encrypt(apiKey, secret);

  await getAdminDb()
    .collection(USER_DOC_COLLECTION)
    .doc(uid)
    .collection(SECRET_SUBCOLLECTION)
    .doc(SECRET_DOC_ID)
    .set({
      ...encrypted,
      updatedAt: Date.now(),
    } satisfies EncryptedByokSecret);

  return { last4 };
}

export async function clearUserByokSecret(uid: string): Promise<void> {
  await getAdminDb()
    .collection(USER_DOC_COLLECTION)
    .doc(uid)
    .collection(SECRET_SUBCOLLECTION)
    .doc(SECRET_DOC_ID)
    .delete()
    .catch(() => undefined);
}

export async function getUserByokApiKey(uid: string): Promise<string | null> {
  const snap = await getAdminDb()
    .collection(USER_DOC_COLLECTION)
    .doc(uid)
    .collection(SECRET_SUBCOLLECTION)
    .doc(SECRET_DOC_ID)
    .get();

  if (!snap.exists) return null;
  const data = snap.data() as EncryptedByokSecret | undefined;
  if (!data?.ciphertext || !data.iv || !data.tag) return null;

  const secret = getEncryptionSecret();
  return decrypt(data, secret);
}

export async function getUsageSnapshot(uid: string): Promise<UsageDoc> {
  const monthKey = getMonthKey();
  const usageRef = getAdminDb()
    .collection(USER_DOC_COLLECTION)
    .doc(uid)
    .collection(USAGE_SUBCOLLECTION)
    .doc(`gemini_${monthKey}`);

  const usageSnap = await usageRef.get();
  if (!usageSnap.exists) {
    return {
      month: monthKey,
      estimatedInputTokens: 0,
      estimatedOutputTokens: 0,
      estimatedSpendUsd: 0,
      byokSpendUsd: 0,
      platformSpendUsd: 0,
      requestCount: 0,
      featureCounts: {},
      updatedAt: Date.now(),
    };
  }
  return usageSnap.data() as UsageDoc;
}

export async function trackGeminiUsage(params: {
  uid: string;
  model: GeminiModelId;
  feature: string;
  keySource: GeminiKeySource;
  inputChars: number;
  outputChars: number;
}): Promise<void> {
  const usage = await getUsageSnapshot(params.uid);
  const monthKey = getMonthKey();
  const usageRef = getAdminDb()
    .collection(USER_DOC_COLLECTION)
    .doc(params.uid)
    .collection(USAGE_SUBCOLLECTION)
    .doc(`gemini_${monthKey}`);

  const inputTokens = Math.ceil(Math.max(0, params.inputChars) / 4);
  const outputTokens = Math.ceil(Math.max(0, params.outputChars) / 4);
  const estimatedCost = estimateCostUsd(params.model, inputTokens, outputTokens);

  usage.featureCounts[params.feature] = (usage.featureCounts[params.feature] ?? 0) + 1;

  await usageRef.set(
    {
      month: monthKey,
      estimatedInputTokens: usage.estimatedInputTokens + inputTokens,
      estimatedOutputTokens: usage.estimatedOutputTokens + outputTokens,
      estimatedSpendUsd: roundUsd(usage.estimatedSpendUsd + estimatedCost),
      byokSpendUsd: roundUsd(usage.byokSpendUsd + (params.keySource === 'byok' ? estimatedCost : 0)),
      platformSpendUsd: roundUsd(usage.platformSpendUsd + (params.keySource === 'platform' ? estimatedCost : 0)),
      requestCount: usage.requestCount + 1,
      featureCounts: usage.featureCounts,
      updatedAt: Date.now(),
    } satisfies UsageDoc,
    { merge: true },
  );
}

export async function resolveGeminiKeyForUser(params: {
  uid?: string;
  model: GeminiModelId;
  fallbackApiKey: string;
}): Promise<{
  apiKey: string;
  keySource: GeminiKeySource;
  status: ByokStatus;
}> {
  if (!params.uid) {
    return {
      apiKey: params.fallbackApiKey,
      keySource: 'platform',
      status: {
        enabled: false,
        monthlyBudgetUsd: DEFAULT_BUDGET_USD,
        hardStop: false,
        estimatedMonthlySpendUsd: 0,
        budgetExceeded: false,
      },
    };
  }

  const userRef = getAdminDb().collection(USER_DOC_COLLECTION).doc(params.uid);
  const [userSnap, usage] = await Promise.all([userRef.get(), getUsageSnapshot(params.uid)]);
  const userData = (userSnap.data() ?? {}) as {
    byokEnabled?: boolean;
    byokKeyLast4?: string;
    byokMonthlyBudgetUsd?: number;
    byokHardStop?: boolean;
  };

  const monthlyBudgetUsd = userData.byokMonthlyBudgetUsd ?? DEFAULT_BUDGET_USD;
  const hardStop = userData.byokHardStop ?? false;
  const budgetExceeded = usage.estimatedSpendUsd >= monthlyBudgetUsd;
  const status: ByokStatus = {
    enabled: userData.byokEnabled ?? false,
    keyLast4: userData.byokKeyLast4,
    monthlyBudgetUsd,
    hardStop,
    estimatedMonthlySpendUsd: usage.estimatedSpendUsd,
    budgetExceeded,
  };

  if (!status.enabled) {
    return { apiKey: params.fallbackApiKey, keySource: 'platform', status };
  }

  if (budgetExceeded && hardStop) {
    throw new Error('BYOK monthly budget exceeded (hard stop enabled).');
  }

  const byokKey = await getUserByokApiKey(params.uid);
  if (!byokKey) {
    return { apiKey: params.fallbackApiKey, keySource: 'platform', status };
  }

  if (budgetExceeded && !hardStop) {
    return { apiKey: params.fallbackApiKey, keySource: 'platform', status };
  }

  return { apiKey: byokKey, keySource: 'byok', status };
}

export function estimateCostUsd(model: GeminiModelId, inputTokens: number, outputTokens: number): number {
  const multiplier = MODEL_COST_MULTIPLIER[model] ?? 1;
  const inputCost = (inputTokens / 1_000_000) * EST_INPUT_USD_PER_1M * multiplier;
  const outputCost = (outputTokens / 1_000_000) * EST_OUTPUT_USD_PER_1M * multiplier;
  return roundUsd(inputCost + outputCost);
}

function roundUsd(value: number): number {
  return Math.round(value * 1_000_000) / 1_000_000;
}

function getMonthKey(): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `${year}_${month}`;
}

function getEncryptionSecret(): string {
  const secret = process.env.BYOK_ENCRYPTION_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('BYOK_ENCRYPTION_SECRET must be configured (min 16 chars).');
  }
  return secret;
}

function encrypt(plainText: string, secret: string): EncryptedByokSecret {
  const key = createHash('sha256').update(secret).digest();
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  const ciphertext = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();

  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    tag: tag.toString('base64'),
    updatedAt: Date.now(),
  };
}

function decrypt(payload: EncryptedByokSecret, secret: string): string {
  const key = createHash('sha256').update(secret).digest();
  const iv = Buffer.from(payload.iv, 'base64');
  const decipher = createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(Buffer.from(payload.tag, 'base64'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
}
