import fs from 'fs/promises';
import path from 'path';

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

interface LocalDBData {
  otps: OTPRecord[];
  logs: LogRecord[];
}

const LOCAL_DB_DIR = path.join(process.cwd(), 'db');
const LOCAL_DB_PATH = path.join(LOCAL_DB_DIR, 'db.json');

// --- Supabase Config ---
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const isSupabaseConfigured = () => {
  return !!(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
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
      await fetch(`${SUPABASE_URL}/rest/v1/otps?email=eq.${encodeURIComponent(normalizedEmail)}`, {
        method: 'DELETE',
        headers: getSupabaseHeaders(),
      });

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
    } catch (err) {
      console.error('Supabase saveOTP failed. Falling back to local file.', err);
      await saveOTPLocal(normalizedEmail, code, expiresAt);
    }
  } else {
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
        throw new Error('Supabase fetch OTP failed');
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
    } catch (err) {
      console.error('Supabase getOTP failed. Falling back to local file.', err);
      return getOTPLocal(normalizedEmail);
    }
  } else {
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
      await fetch(`${SUPABASE_URL}/rest/v1/otps?email=eq.${encodeURIComponent(normalizedEmail)}`, {
        method: 'DELETE',
        headers: getSupabaseHeaders()
      });
    } catch (err) {
      console.error('Supabase deleteOTP failed. Falling back to local file.', err);
      await deleteOTPLocal(normalizedEmail);
    }
  } else {
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
    } catch (err) {
      console.error('Supabase addLog failed. Falling back to local file.', err);
      return addLogLocal(logId, normalizedEmail, loginTime);
    }
  } else {
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
    } catch (err) {
      console.error('Supabase updateLogoutTime failed. Falling back to local file.', err);
      await updateLogoutTimeLocal(logId, logoutTime);
    }
  } else {
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
        throw new Error('Supabase fetch logs failed');
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
    } catch (err) {
      console.error('Supabase getAllLogs failed. Falling back to local file.', err);
      return getAllLogsLocal();
    }
  } else {
    return getAllLogsLocal();
  }
}

async function getAllLogsLocal(): Promise<LogRecord[]> {
  const db = await readLocalDB();
  // Sort descending by login time
  return [...db.logs].sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
}
