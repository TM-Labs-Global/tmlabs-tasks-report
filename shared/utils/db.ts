import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export interface OTPRecord {
  email: string;
  code: string;
  expiresAt: number;
}

export interface LogRecord {
  id: string;
  email: string;
  loginTime: string;
  logoutTime: string | null;
}

export interface UserRecord {
  id: string;
  email: string;
  passwordHash?: string;
  passwordSalt?: string;
  role: 'product_manager' | 'staff' | 'stakeholder';
  status: 'active' | 'pending' | 'deactivated';
  fullName?: string;
  avatarUrl?: string;
  createdAt?: string;
  hasPassword?: boolean;
}

interface LocalDBData {
  users?: UserRecord[];
  otps: OTPRecord[];
  logs: LogRecord[];
}

const LOCAL_DB_DIR = path.join(process.cwd(), 'db');
const LOCAL_DB_PATH = path.join(LOCAL_DB_DIR, 'db.json');

// --- Supabase Config ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isSupabaseConfigured = () => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return false;
  
  const placeholders = [
    'your-project-ref',
    'your-service-role-key',
    'project-ref-here'
  ];
  
  const isPlaceholder = placeholders.some(
    p => SUPABASE_URL.includes(p) || SUPABASE_SERVICE_ROLE_KEY.includes(p)
  );
  
  return !isPlaceholder;
};

const isServerlessProduction = () => {
  return (
    process.env.NODE_ENV === 'production' ||
    process.env.NETLIFY === 'true' ||
    process.env.VERCEL === 'true'
  );
};

// --- Helper for Supabase Headers ---
function getSupabaseHeaders() {
  return {
    'apikey': SUPABASE_SERVICE_ROLE_KEY || '',
    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  };
}

// --- Local File DB Helper with Atomic Write ---
async function readLocalDB(): Promise<LocalDBData> {
  try {
    await fs.mkdir(LOCAL_DB_DIR, { recursive: true });
    try {
      const dataStr = await fs.readFile(LOCAL_DB_PATH, 'utf-8');
      return JSON.parse(dataStr) as LocalDBData;
    } catch (e: any) {
      if (e.code === 'ENOENT') {
        const initialData: LocalDBData = { otps: [], logs: [] };
        await writeLocalDB(initialData);
        return initialData;
      }
      throw e;
    }
  } catch (err) {
    console.error('Error reading local JSON db:', err);
    return { otps: [], logs: [] };
  }
}

async function writeLocalDB(data: LocalDBData): Promise<void> {
  try {
    await fs.mkdir(LOCAL_DB_DIR, { recursive: true });
    const dataStr = JSON.stringify(data, null, 2);
    const tmpPath = `${LOCAL_DB_PATH}.tmp`;
    
    // Atomic write pattern: write to tmp file first, then rename
    await fs.writeFile(tmpPath, dataStr, 'utf-8');
    await fs.rename(tmpPath, LOCAL_DB_PATH);
  } catch (err) {
    console.error('Error writing local JSON db:', err);
  }
}

// --- Combined Hybrid DB Operations ---

/**
 * Saves a generated OTP to the database.
 */
export async function saveOTP(email: string, code: string, expiresAt: number): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  
  if (isSupabaseConfigured()) {
    try {
      // 1. Delete any existing OTP first to avoid unique constraint issues
      const delRes = await fetch(`${SUPABASE_URL}/rest/v1/otps?email=eq.${encodeURIComponent(normalizedEmail)}`, {
        method: 'DELETE',
        headers: getSupabaseHeaders(),
      });
      if (!delRes.ok) {
        const errText = await delRes.text();
        throw new Error(`Supabase error deleting old OTP: ${errText}`);
      }

      // 2. Insert new OTP record
      const res = await fetch(`${SUPABASE_URL}/rest/v1/otps`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
          email: normalizedEmail,
          code,
          expires_at: expiresAt
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase error saving OTP: ${errText}`);
      }
    } catch (err: any) {
      console.warn('Supabase saveOTP falling back to local:', err?.message || err);
      if (isServerlessProduction()) {
        throw err;
      }
      await saveOTPLocal(normalizedEmail, code, expiresAt);
    }
  } else {
    if (isServerlessProduction()) {
      throw new Error('Supabase is not configured in this production serverless environment.');
    }
    await saveOTPLocal(normalizedEmail, code, expiresAt);
  }
}

async function saveOTPLocal(email: string, code: string, expiresAt: number) {
  const db = await readLocalDB();
  // Remove existing OTP for this email
  db.otps = db.otps.filter(o => o.email !== email);
  // Add new
  db.otps.push({ email, code, expiresAt });
  await writeLocalDB(db);
}

/**
 * Retrieves an active OTP for an email.
 */
export async function getOTP(email: string): Promise<OTPRecord | null> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/otps?email=eq.${encodeURIComponent(normalizedEmail)}&select=*`, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase fetch OTP failed: ${errText}`);
      }

      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        const item = data[0];
        return {
          email: item.email,
          code: item.code,
          expiresAt: Number(item.expires_at)
        };
      }
      return null;
    } catch (err: any) {
      console.warn('Supabase getOTP falling back to local:', err?.message || err);
      if (isServerlessProduction()) {
        throw err;
      }
      return getOTPLocal(normalizedEmail);
    }
  } else {
    if (isServerlessProduction()) {
      throw new Error('Supabase is not configured in this production serverless environment.');
    }
    return getOTPLocal(normalizedEmail);
  }
}

async function getOTPLocal(email: string): Promise<OTPRecord | null> {
  const db = await readLocalDB();
  const found = db.otps.find(o => o.email === email);
  return found || null;
}

/**
 * Deletes an OTP code after successful verification.
 */
export async function deleteOTP(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/otps?email=eq.${encodeURIComponent(normalizedEmail)}`, {
        method: 'DELETE',
        headers: getSupabaseHeaders()
      });
      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase deleteOTP failed: ${errText}`);
      }
    } catch (err: any) {
      console.warn('Supabase deleteOTP falling back to local:', err?.message || err);
      if (isServerlessProduction()) {
        throw err;
      }
      await deleteOTPLocal(normalizedEmail);
    }
  } else {
    if (isServerlessProduction()) {
      throw new Error('Supabase is not configured in this production serverless environment.');
    }
    await deleteOTPLocal(normalizedEmail);
  }
}

async function deleteOTPLocal(email: string) {
  const db = await readLocalDB();
  db.otps = db.otps.filter(o => o.email !== email);
  await writeLocalDB(db);
}

/**
 * Creates a new active login audit log entry.
 * Returns the generated log ID.
 */
export async function addLog(email: string): Promise<string> {
  const logId = crypto.randomUUID();
  const loginTime = new Date().toISOString();
  const normalizedEmail = email.toLowerCase().trim();

  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/logs`, {
        method: 'POST',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
          id: logId,
          email: normalizedEmail,
          login_time: loginTime,
          logout_time: null
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase logs insert failed: ${errText}`);
      }
      return logId;
    } catch (err: any) {
      console.error('Supabase addLog failed.', err);
      if (isServerlessProduction()) {
        throw err;
      }
      return addLogLocal(logId, normalizedEmail, loginTime);
    }
  } else {
    if (isServerlessProduction()) {
      throw new Error('Supabase is not configured in this production serverless environment.');
    }
    return addLogLocal(logId, normalizedEmail, loginTime);
  }
}

async function addLogLocal(logId: string, email: string, loginTime: string): Promise<string> {
  const db = await readLocalDB();
  db.logs.push({
    id: logId,
    email,
    loginTime,
    logoutTime: null
  });
  await writeLocalDB(db);
  return logId;
}

/**
 * Registers the logout event for an active session.
 */
export async function updateLogoutTime(logId: string): Promise<void> {
  const logoutTime = new Date().toISOString();

  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/logs?id=eq.${encodeURIComponent(logId)}`, {
        method: 'PATCH',
        headers: getSupabaseHeaders(),
        body: JSON.stringify({
          logout_time: logoutTime
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase logs update failed: ${errText}`);
      }
    } catch (err: any) {
      console.error('Supabase updateLogoutTime failed.', err);
      if (isServerlessProduction()) {
        throw err;
      }
      await updateLogoutTimeLocal(logId, logoutTime);
    }
  } else {
    if (isServerlessProduction()) {
      throw new Error('Supabase is not configured in this production serverless environment.');
    }
    await updateLogoutTimeLocal(logId, logoutTime);
  }
}

async function updateLogoutTimeLocal(logId: string, logoutTime: string) {
  const db = await readLocalDB();
  const log = db.logs.find(l => l.id === logId);
  if (log) {
    log.logoutTime = logoutTime;
    await writeLocalDB(db);
  }
}

/**
 * Retrieves all session logs. Sorted by login time descending.
 */
export async function getAllLogs(): Promise<LogRecord[]> {
  if (isSupabaseConfigured()) {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/logs?select=*&order=login_time.desc`, {
        method: 'GET',
        headers: getSupabaseHeaders()
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Supabase fetch logs failed: ${errText}`);
      }

      const data = await res.json();
      if (Array.isArray(data)) {
        return data.map(item => ({
          id: item.id,
          email: item.email,
          loginTime: item.login_time,
          logoutTime: item.logout_time
        }));
      }
      return [];
    } catch (err: any) {
      console.error('Supabase getAllLogs failed.', err);
      if (isServerlessProduction()) {
        throw err;
      }
      return getAllLogsLocal();
    }
  } else {
    if (isServerlessProduction()) {
      throw new Error('Supabase is not configured in this production serverless environment.');
    }
    return getAllLogsLocal();
  }
}

async function getAllLogsLocal(): Promise<LogRecord[]> {
  const db = await readLocalDB();
  // Sort descending by login time
  return [...db.logs].sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
}

// --- Password Hashing & User Account Management ---

/**
 * Hashes a password using PBKDF2 with SHA-512 and salt.
 */
export function hashPassword(password: string, existingSalt?: string) {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

/**
 * Verifies a password against a stored hash and salt.
 */
export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!password || !hash || !salt) return false;
  const calculatedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return calculatedHash === hash;
}

/**
 * Default initial users if none exist in the local db
 */
const DEFAULT_INITIAL_USERS: UserRecord[] = [
  {
    id: 'user-pm-info',
    email: 'info@tmlabs.xyz',
    role: 'product_manager',
    status: 'active',
    fullName: 'TM Labs PM',
    hasPassword: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-pm-ops',
    email: 'operations@tmlabs.xyz',
    role: 'product_manager',
    status: 'active',
    fullName: 'Operations',
    hasPassword: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-staff-roseline',
    email: 'roseline@tmlabs.xyz',
    role: 'staff',
    status: 'active',
    fullName: 'Roseline',
    hasPassword: false,
    createdAt: new Date().toISOString()
  }
];

/**
 * Retrieves all registered users from local DB.
 */
export async function getAllUsers(): Promise<UserRecord[]> {
  const db = await readLocalDB();
  if (!db.users || db.users.length === 0) {
    db.users = [...DEFAULT_INITIAL_USERS];
    await writeLocalDB(db);
  }
  return db.users;
}

/**
 * Retrieves a user by their email address.
 */
export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.toLowerCase().trim();
  const users = await getAllUsers();
  const found = users.find(u => u.email.toLowerCase() === normalized);
  return found || null;
}

/**
 * Saves or updates a user in the database.
 */
export async function saveUser(userData: Partial<UserRecord> & { email: string }): Promise<UserRecord> {
  const normalized = userData.email.toLowerCase().trim();
  const db = await readLocalDB();
  if (!db.users) db.users = [...DEFAULT_INITIAL_USERS];

  const index = db.users.findIndex(u => u.email.toLowerCase() === normalized);
  let updatedUser: UserRecord;

  if (index >= 0) {
    updatedUser = {
      ...db.users[index],
      ...userData,
      email: normalized,
      hasPassword: !!(userData.passwordHash || db.users[index].passwordHash)
    };
    db.users[index] = updatedUser;
  } else {
    updatedUser = {
      id: userData.id || crypto.randomUUID(),
      role: userData.role || (db.users.length === 0 ? 'product_manager' : 'staff'),
      status: userData.status || 'active',
      fullName: userData.fullName || normalized.split('@')[0],
      createdAt: userData.createdAt || new Date().toISOString(),
      hasPassword: !!userData.passwordHash,
      ...userData,
      email: normalized
    };
    db.users.push(updatedUser);
  }

  await writeLocalDB(db);
  return updatedUser;
}

/**
 * Updates a user's password and sets status to active.
 */
export async function setUserPassword(email: string, password: string): Promise<UserRecord> {
  const { hash, salt } = hashPassword(password);
  return saveUser({
    email,
    passwordHash: hash,
    passwordSalt: salt,
    status: 'active',
    hasPassword: true
  });
}

