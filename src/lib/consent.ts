/**
 * Cookie / third-party-loading consent.
 *
 * Lumina deliberately keeps consent narrow: the only thing we gate is loading
 * of third-party telemetry (Vercel Analytics, Speed Insights, future live
 * chat). First-party cookies required to operate the app — auth tokens, BYOK
 * encryption material — are *strictly necessary* and not gated.
 */

import { useSyncExternalStore } from "react";

export type ConsentStatus = "pending" | "accepted" | "rejected";

export interface ConsentRecord {
  status: ConsentStatus;
  /** Bumped when the consent surface changes meaningfully. */
  version: number;
  /** Epoch ms when the user made the choice. Null while pending. */
  decidedAt: number | null;
}

export const CONSENT_VERSION = 1;
const STORAGE_KEY = "lumina:consent";
const CONSENT_CHANGED_EVENT = "lumina:consent-changed";

const PENDING: ConsentRecord = {
  status: "pending",
  version: CONSENT_VERSION,
  decidedAt: null,
};

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readRecord(): ConsentRecord {
  if (!isBrowser()) return PENDING;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return PENDING;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (
      parsed.status === "accepted" ||
      parsed.status === "rejected" ||
      parsed.status === "pending"
    ) {
      if (parsed.version !== CONSENT_VERSION) return PENDING;
      return {
        status: parsed.status,
        version: parsed.version,
        decidedAt: typeof parsed.decidedAt === "number" ? parsed.decidedAt : null,
      };
    }
  } catch {
    // fall through to PENDING
  }
  return PENDING;
}

function writeRecord(next: ConsentRecord) {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CONSENT_CHANGED_EVENT, { detail: next }));
  } catch {
    // localStorage may be disabled; we treat that as pending.
  }
}

export function getConsent(): ConsentRecord {
  return readRecord();
}

export function setConsent(status: Exclude<ConsentStatus, "pending">) {
  writeRecord({
    status,
    version: CONSENT_VERSION,
    decidedAt: Date.now(),
  });
}

export function clearConsent() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    window.dispatchEvent(
      new CustomEvent(CONSENT_CHANGED_EVENT, { detail: PENDING })
    );
  } catch {
    // ignore
  }
}

// useSyncExternalStore plumbing — the snapshot is cached so equal records
// short-circuit re-renders.
let cachedSnapshot: ConsentRecord = PENDING;

function recordsEqual(a: ConsentRecord, b: ConsentRecord): boolean {
  return (
    a.status === b.status &&
    a.version === b.version &&
    a.decidedAt === b.decidedAt
  );
}

function getSnapshot(): ConsentRecord {
  const next = readRecord();
  if (!recordsEqual(next, cachedSnapshot)) {
    cachedSnapshot = next;
  }
  return cachedSnapshot;
}

function getServerSnapshot(): ConsentRecord {
  return PENDING;
}

function subscribe(callback: () => void): () => void {
  if (!isBrowser()) return () => undefined;

  const onCustom = () => callback();
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY) callback();
  };

  window.addEventListener(CONSENT_CHANGED_EVENT, onCustom);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CONSENT_CHANGED_EVENT, onCustom);
    window.removeEventListener("storage", onStorage);
  };
}

/**
 * React hook that subscribes to consent changes within and across tabs via
 * `useSyncExternalStore`. Returns the current record and stable setter trio.
 */
export function useConsent() {
  const consent = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  return {
    consent,
    accept: () => setConsent("accepted"),
    reject: () => setConsent("rejected"),
    reset: () => clearConsent(),
  } as const;
}
