import { MongoClient, Db } from 'mongodb';

const rawUri = process.env.MONGODB_URI || '';
const dbName = process.env.MONGODB_DB_NAME || 'tmlabs-tasks';

// Convert mongodb+srv:// to direct shard nodes to prevent DNS SRV failures (querySrv ECONNREFUSED) in serverless environments
function resolveMongoUri(inputUri: string): string {
  if (!inputUri) return '';
  if (inputUri.includes('tm-labs.hejup6c.mongodb.net') || inputUri.startsWith('mongodb+srv://')) {
    const match = inputUri.match(/mongodb\+srv:\/\/([^:]+):([^@]+)@/);
    if (match) {
      const [, user, pass] = match;
      return `mongodb://${user}:${pass}@ac-z30kzww-shard-00-00.hejup6c.mongodb.net:27017,ac-z30kzww-shard-00-01.hejup6c.mongodb.net:27017,ac-z30kzww-shard-00-02.hejup6c.mongodb.net:27017/${dbName}?ssl=true&replicaSet=atlas-ai962u-shard-0&authSource=admin&retryWrites=true&w=majority`;
    }
  }
  return inputUri;
}

const activeUri = resolveMongoUri(rawUri);

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const options = {
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
  connectTimeoutMS: 10000,
};

// Cache clientPromise across warm serverless function invocations
if (!global._mongoClientPromise) {
  if (activeUri) {
    client = new MongoClient(activeUri, options);
    global._mongoClientPromise = client.connect();
  } else {
    global._mongoClientPromise = Promise.reject(new Error('MONGODB_URI environment variable is missing.'));
  }
}
clientPromise = global._mongoClientPromise;

export async function getDb(): Promise<Db> {
  if (!activeUri) {
    throw new Error('MONGODB_URI environment variable is missing.');
  }
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
  } catch (err) {
    // If warm client disconnected, reconnect cleanly
    console.warn('Reconnecting MongoDB client...', err);
    client = new MongoClient(activeUri, options);
    global._mongoClientPromise = client.connect();
    clientPromise = global._mongoClientPromise;
    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
  }
}

export default clientPromise;
