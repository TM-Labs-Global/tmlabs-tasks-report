import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getDb } from '@/shared/utils/mongoClient';

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
    await fs.writeFile(tmpPath, dataStr, 'utf-8');
    await fs.rename(tmpPath, LOCAL_DB_PATH);
  } catch (err) {
    console.error('Error writing local JSON db:', err);
  }
}

// --- OTP Operations ---

/**
 * Saves a generated OTP to MongoDB Atlas (with safe local fallback).
 */
export async function saveOTP(email: string, code: string, expiresAt: number): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const db = await getDb();
    await db.collection('otps').updateOne(
      { email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') } },
      {
        $set: {
          email: normalizedEmail,
          code: String(code).trim(),
          expiresAt: Number(expiresAt),
          updated_at: new Date().toISOString()
        }
      },
      { upsert: true }
    );
  } catch (err) {
    console.error('MongoDB saveOTP error:', err);
  }

  // Safe local cache attempt (ignored if serverless read-only filesystem)
  try {
    await saveOTPLocal(normalizedEmail, code, expiresAt);
  } catch {}
}

async function saveOTPLocal(email: string, code: string, expiresAt: number) {
  try {
    const db = await readLocalDB();
    db.otps = (db.otps || []).filter(o => o.email !== email);
    db.otps.push({ email, code, expiresAt });
    await writeLocalDB(db);
  } catch {}
}

/**
 * Retrieves the active OTP for an email from MongoDB Atlas.
 */
export async function getOTP(email: string): Promise<OTPRecord | null> {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const db = await getDb();
    const doc = await db.collection('otps').findOne({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
    if (doc) {
      return {
        email: doc.email,
        code: String(doc.code).trim(),
        expiresAt: Number(doc.expiresAt)
      };
    }
  } catch (err) {
    console.error('MongoDB getOTP error:', err);
  }

  try {
    return await getOTPLocal(normalizedEmail);
  } catch {}
  return null;
}

async function getOTPLocal(email: string): Promise<OTPRecord | null> {
  try {
    const db = await readLocalDB();
    const found = (db.otps || []).find(o => o.email === email);
    return found || null;
  } catch {
    return null;
  }
}

/**
 * Deletes an OTP code after verification from MongoDB Atlas.
 */
export async function deleteOTP(email: string): Promise<void> {
  const normalizedEmail = email.toLowerCase().trim();
  try {
    const db = await getDb();
    await db.collection('otps').deleteMany({
      email: { $regex: new RegExp(`^${normalizedEmail}$`, 'i') }
    });
  } catch (err) {
    console.error('MongoDB deleteOTP error:', err);
  }
  try {
    await deleteOTPLocal(normalizedEmail);
  } catch {}
}

async function deleteOTPLocal(email: string) {
  try {
    const db = await readLocalDB();
    db.otps = (db.otps || []).filter(o => o.email !== email);
    await writeLocalDB(db);
  } catch {}
}

// --- Session Logs Operations ---

/**
 * Creates a new active login audit log entry in MongoDB Atlas.
 */
export async function addLog(email: string): Promise<string> {
  const logId = crypto.randomUUID();
  const loginTime = new Date().toISOString();
  const normalizedEmail = email.toLowerCase().trim();

  try {
    const db = await getDb();
    await db.collection('logs').insertOne({
      id: logId,
      email: normalizedEmail,
      login_time: loginTime,
      loginTime,
      logout_time: null,
      logoutTime: null
    });
    return logId;
  } catch (err) {
    console.warn('MongoDB addLog fallback to local:', err);
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
  try {
    const db = await getDb();
    await db.collection('logs').updateOne(
      { id: logId },
      { $set: { logout_time: logoutTime, logoutTime } }
    );
  } catch (err) {
    console.warn('MongoDB updateLogoutTime fallback to local:', err);
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
 * Retrieves all session logs sorted descending.
 */
export async function getAllLogs(): Promise<LogRecord[]> {
  try {
    const db = await getDb();
    const docs = await db.collection('logs').find({}).sort({ loginTime: -1, login_time: -1 }).toArray();
    return docs.map(d => ({
      id: d.id,
      email: d.email,
      loginTime: d.loginTime || d.login_time,
      logoutTime: d.logoutTime || d.logout_time || null
    }));
  } catch (err) {
    console.warn('MongoDB getAllLogs fallback to local:', err);
    return getAllLogsLocal();
  }
}

async function getAllLogsLocal(): Promise<LogRecord[]> {
  const db = await readLocalDB();
  return [...db.logs].sort((a, b) => new Date(b.loginTime).getTime() - new Date(a.loginTime).getTime());
}

// --- Password & User Management ---

export function hashPassword(password: string, existingSalt?: string) {
  const salt = existingSalt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  if (!password || !hash || !salt) return false;
  const calculatedHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return calculatedHash === hash;
}

function mapMongoUser(doc: any): UserRecord {
  return {
    id: doc.id || String(doc._id),
    email: doc.email,
    passwordHash: doc.passwordHash || doc.password_hash,
    passwordSalt: doc.passwordSalt || doc.password_salt,
    role: doc.role || 'staff',
    status: doc.status || 'active',
    fullName: doc.fullName || doc.full_name || doc.name,
    avatarUrl: doc.avatarUrl || doc.avatar_url || doc.profile_picture,
    createdAt: doc.createdAt || doc.created_at,
    hasPassword: doc.hasPassword ?? (!!(doc.passwordHash || doc.password_hash))
  };
}

/**
 * Retrieves all users from MongoDB Atlas `users` collection.
 */
export async function getAllUsers(): Promise<UserRecord[]> {
  try {
    const db = await getDb();
    const users = await db.collection('users').find({}).toArray();
    if (users.length > 0) {
      return users.map(mapMongoUser);
    }
  } catch (err) {
    console.warn('MongoDB getAllUsers fallback to local:', err);
  }
  const localDb = await readLocalDB();
  return localDb.users || [];
}

/**
 * Retrieves a user by their email address from MongoDB Atlas.
 */
export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.toLowerCase().trim();
  try {
    const db = await getDb();
    const doc = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${normalized}$`, 'i') }
    });
    if (doc) {
      return mapMongoUser(doc);
    }
  } catch (err) {
    console.warn('MongoDB getUserByEmail fallback to local:', err);
  }
  const users = await getAllUsers();
  return users.find(u => u.email.toLowerCase() === normalized) || null;
}

/**
 * Saves or updates a user in MongoDB Atlas (with local file fallback).
 */
export async function saveUser(userData: Partial<UserRecord> & { email: string }): Promise<UserRecord> {
  const normalized = userData.email.toLowerCase().trim();

  try {
    const db = await getDb();

    const updateFields: any = {
      email: normalized,
      updated_at: new Date().toISOString()
    };

    if (userData.passwordHash) {
      updateFields.passwordHash = userData.passwordHash;
      updateFields.password_hash = userData.passwordHash;
      updateFields.hasPassword = true;
    }
    if (userData.passwordSalt) {
      updateFields.passwordSalt = userData.passwordSalt;
      updateFields.password_salt = userData.passwordSalt;
    }
    if (userData.role) updateFields.role = userData.role;
    if (userData.status) updateFields.status = userData.status;
    if (userData.fullName) {
      updateFields.fullName = userData.fullName;
      updateFields.full_name = userData.fullName;
    }
    if (userData.avatarUrl) {
      updateFields.avatarUrl = userData.avatarUrl;
      updateFields.avatar_url = userData.avatarUrl;
    }

    await db.collection('users').updateOne(
      { email: { $regex: new RegExp(`^${normalized}$`, 'i') } },
      {
        $set: updateFields,
        $setOnInsert: {
          id: userData.id || crypto.randomUUID(),
          created_at: new Date().toISOString()
        }
      },
      { upsert: true }
    );

    const savedDoc = await db.collection('users').findOne({
      email: { $regex: new RegExp(`^${normalized}$`, 'i') }
    });
    if (savedDoc) {
      // Safe local cache attempt
      try {
        await saveUserLocal(userData);
      } catch {}
      return mapMongoUser(savedDoc);
    }
  } catch (err) {
    console.error('MongoDB saveUser error:', err);
  }

  try {
    await saveUserLocal(userData);
    const localUser = await getUserByEmail(normalized);
    if (localUser) return localUser;
  } catch {}

  return {
    id: userData.id || crypto.randomUUID(),
    email: normalized,
    role: userData.role || 'staff',
    status: userData.status || 'active'
  };
}

async function saveUserLocal(userData: Partial<UserRecord> & { email: string }): Promise<void> {
  const db = await readLocalDB();
  db.users = db.users || [];
  const normalized = userData.email.toLowerCase().trim();
  const index = db.users.findIndex(u => u.email.toLowerCase() === normalized);
  if (index !== -1) {
    db.users[index] = { ...db.users[index], ...userData };
  } else {
    db.users.push({
      id: userData.id || crypto.randomUUID(),
      role: userData.role || 'staff',
      status: userData.status || 'active',
      hasPassword: !!userData.passwordHash,
      createdAt: new Date().toISOString(),
      ...userData,
      email: normalized
    });
  }
  await writeLocalDB(db);
}

/**
 * Updates a user's password and activates account.
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
