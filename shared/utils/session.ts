import crypto from 'crypto';

export interface SessionPayload {
  email: string;
  logId: string;
  expiresAt: number;
  role?: string;
}

const DEFAULT_SECRET = 'tm-labs-task-tracker-default-jwt-secret-key-32-chars-long';

/**
 * Signs a session payload and returns a token string.
 * The token format is: [base64urlEncodedPayload].[base64urlEncodedSignature]
 */
export async function signSession(payload: SessionPayload): Promise<string> {
  const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
  const payloadStr = JSON.stringify(payload);
  const encodedPayload = Buffer.from(payloadStr, 'utf-8').toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', secret)
    .update(encodedPayload)
    .digest('base64url');
  
  return `${encodedPayload}.${signature}`;
}

/**
 * Verifies a token string and returns the payload if valid.
 * Returns null if the signature is invalid or the session is expired.
 */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 2) return null;
    
    const [encodedPayload, encodedSignature] = parts;
    const secret = process.env.JWT_SECRET || DEFAULT_SECRET;
    
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(encodedPayload)
      .digest('base64url');
    
    // Constant-time comparison to prevent timing attacks
    const sigA = Buffer.from(encodedSignature, 'utf-8');
    const sigB = Buffer.from(expectedSignature, 'utf-8');
    if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
      return null;
    }
    
    const payloadStr = Buffer.from(encodedPayload, 'base64url').toString('utf-8');
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
