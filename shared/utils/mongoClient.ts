import dns from 'dns';

// Only set custom DNS fallback on local Windows development where SRV resolution might fail
if (process.env.NODE_ENV === 'development' && process.platform === 'win32') {
  try {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  } catch {
    // Ignore in environments where setServers is restricted
  }
}

import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB_NAME || 'tmlabs-tasks';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

if (!uri) {
  console.warn('MONGODB_URI is not set in environment variables');
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

// Cache clientPromise across warm serverless function invocations
if (!global._mongoClientPromise) {
  if (uri) {
    client = new MongoClient(uri, options);
    global._mongoClientPromise = client.connect();
  } else {
    global._mongoClientPromise = Promise.reject(new Error('MONGODB_URI environment variable is missing.'));
  }
}
clientPromise = global._mongoClientPromise;

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export default clientPromise;
