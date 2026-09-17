import dns from 'dns';
try {
  dns.setServers(['2001:4860:4860::8888', '2001:4860:4860::8844', '8.8.8.8', '1.1.1.1']);
} catch {
  // Ignore in environments where setServers is restricted
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

if (process.env.NODE_ENV === 'development') {
  if (!global._mongoClientPromise && uri) {
    client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise as Promise<MongoClient>;
} else {
  if (uri) {
    client = new MongoClient(uri);
    clientPromise = client.connect();
  } else {
    clientPromise = Promise.reject(new Error('MONGODB_URI is missing'));
  }
}

export async function getDb(): Promise<Db> {
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName);
}

export default clientPromise;
