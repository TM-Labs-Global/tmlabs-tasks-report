export interface SessionPayload {
  email: string;
  logId: string;
  expiresAt: number;
  role?: string;
}

const DEFAULT_SECRET = 'tm-labs-task-tracker-default-jwt-secret-key-32-chars-long';

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = typeof btoa === 'function'
    ? btoa(binary)
    : Buffer.from(binary, 'binary').toString('base64');
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlToBytes(base64url: string): Uint8Array {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = typeof atob === 'function'
    ? atob(base64)
    : Buffer.from(base64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    throw new Error('Web Crypto API (crypto.subtle) is not available in this environment');
  }
  return await subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Signs a session payload and returns a token string.
 * The token format is: [base64urlEncodedPayload].[base64urlEncodedSignature]
 * Compatible with Edge Runtime, Node.js, and Browsers.
 */
export async function signSession(payload: SessionPayload): Promise<string> {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  const payloadStr = JSON.stringify(payload);
  const enc = new TextEncoder();
  const encodedPayload = bytesToBase64Url(enc.encode(payloadStr));
  
  const key = await getCryptoKey(secret);
  const subtle = globalThis.crypto.subtle;
  const signatureBuffer = await subtle.sign(
    'HMAC',
    key,
    enc.encode(encodedPayload)
  );
  
  const signatureBytes = new Uint8Array(signatureBuffer);
  const encodedSignature = bytesToBase64Url(signatureBytes);
  
  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies a token string and returns the payload if valid.
 * Returns null if the signature is invalid or the session is expired.
 * Compatible with Edge Runtime, Node.js, and Browsers.
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [encodedPayload, encodedSignature] = parts;
    const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
    
    const key = await getCryptoKey(secret);
    const subtle = globalThis.crypto.subtle;
    const signatureBytes = base64UrlToBytes(encodedSignature);
    const enc = new TextEncoder();
    
    const isValid = await subtle.verify(
      'HMAC',
      key,
      signatureBytes,
      enc.encode(encodedPayload)
    );
    
    if (!isValid) {
      return null;
    }
    
    const payloadBytes = base64UrlToBytes(encodedPayload);
    const dec = new TextDecoder();
    const payloadStr = dec.decode(payloadBytes);
    const payload = JSON.parse(payloadStr) as SessionPayload;
    
    // Check expiration
    if (!payload.expiresAt || Date.now() > payload.expiresAt) {
      return null;
    }
    
    return payload;
  } catch (err) {
    console.error('Session verification error:', err);
    return null;
  }
}
