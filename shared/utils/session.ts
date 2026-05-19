const encoder = new TextEncoder();
const decoder = new TextDecoder();

// Helper to base64url encode a string
function base64urlEncode(str: string): string {
  const base64 = btoa(str);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper to base64url decode a string
function base64urlDecode(base64url: string): string {
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

// Helper to get Web Crypto Key from secret
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const keyBuffer = encoder.encode(secret);
  return crypto.subtle.importKey(
    'raw',
    keyBuffer,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Signs a session payload and returns a token string.
 * The token format is: [base64urlEncodedPayload].[base64urlEncodedSignature]
 */
export async function signSession(payload: { email: string; logId: string; expiresAt: number }): Promise<string> {
  const secret = process.env.JWT_SECRET || 'tm-labs-task-tracker-default-jwt-secret-key-32-chars-long';
  const key = await getCryptoKey(secret);
  
  const payloadStr = JSON.stringify(payload);
  const encodedPayload = base64urlEncode(payloadStr);
  
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(encodedPayload)
  );
  
  const signatureArray = Array.from(new Uint8Array(signatureBuffer));
  const signatureStr = String.fromCharCode(...signatureArray);
  const encodedSignature = base64urlEncode(signatureStr);
  
  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * Verifies a token string and returns the payload if valid.
 * Returns null if the signature is invalid or the session is expired.
 */
export async function verifySession(token: string): Promise<{ email: string; logId: string; expiresAt: number } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [encodedPayload, encodedSignature] = parts;
    const secret = process.env.JWT_SECRET || 'tm-labs-task-tracker-default-jwt-secret-key-32-chars-long';
    const key = await getCryptoKey(secret);
    
    // Verify signature
    const signatureStr = base64urlDecode(encodedSignature);
    const signatureBuffer = new Uint8Array(signatureStr.split('').map(c => c.charCodeAt(0))).buffer;
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(encodedPayload)
    );
    
    if (!isValid) return null;
    
    // Decode payload
    const payloadStr = base64urlDecode(encodedPayload);
    const payload = JSON.parse(payloadStr) as { email: string; logId: string; expiresAt: number };
    
    // Check expiration
    if (Date.now() > payload.expiresAt) {
      return null;
    }
    
    return payload;
  } catch (err) {
    console.error('Session verification error:', err);
    return null;
  }
}
