const LOCAL_BYOK_STORAGE_PREFIX = 'lumina:byok:v1:';
const LOCAL_BYOK_KEY_SALT = process.env.NEXT_PUBLIC_BYOK_LOCAL_KEY_SALT ?? 'lumina-local-byok';

interface EncryptedLocalByokPayload {
  version: 1;
  iv: string;
  ciphertext: string;
  updatedAt: number;
}

function hasLocalStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function hasWebCrypto(): boolean {
  return typeof window !== 'undefined' && typeof window.crypto?.subtle !== 'undefined';
}

function storageKey(uid: string): string {
  return `${LOCAL_BYOK_STORAGE_PREFIX}${uid}`;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return window.btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = window.atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function bytesToArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

async function deriveKey(uid: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const material = await window.crypto.subtle.digest(
    'SHA-256',
    encoder.encode(`${uid}:${LOCAL_BYOK_KEY_SALT}`),
  );
  return window.crypto.subtle.importKey('raw', material, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
}

export async function setLocalByokApiKey(uid: string, apiKey: string): Promise<boolean> {
  if (!hasLocalStorage() || !hasWebCrypto() || !uid || !apiKey) return false;

  try {
    const key = await deriveKey(uid);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const payloadBytes = new TextEncoder().encode(apiKey);
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      payloadBytes,
    );

    const payload: EncryptedLocalByokPayload = {
      version: 1,
      iv: bytesToBase64(iv),
      ciphertext: bytesToBase64(new Uint8Array(encrypted)),
      updatedAt: Date.now(),
    };

    window.localStorage.setItem(storageKey(uid), JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export async function getLocalByokApiKey(uid: string): Promise<string | null> {
  if (!hasLocalStorage() || !hasWebCrypto() || !uid) return null;
  const raw = window.localStorage.getItem(storageKey(uid));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<EncryptedLocalByokPayload>;
    if (parsed.version !== 1 || !parsed.iv || !parsed.ciphertext) return null;

    const key = await deriveKey(uid);
    const iv = bytesToArrayBuffer(base64ToBytes(parsed.iv));
    const ciphertext = bytesToArrayBuffer(base64ToBytes(parsed.ciphertext));
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    return null;
  }
}

export async function hasLocalByokApiKey(uid: string): Promise<boolean> {
  const key = await getLocalByokApiKey(uid);
  return Boolean(key && key.trim().length >= 20);
}

export function clearLocalByokApiKey(uid: string): void {
  if (!hasLocalStorage() || !uid) return;
  window.localStorage.removeItem(storageKey(uid));
}
