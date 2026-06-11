import { MongoClient } from "mongodb";
import dns from "dns";


/**
 * Native MongoDB client — used exclusively by the Auth.js MongoDB adapter,
 * which expects a raw `MongoClient`/`Promise<MongoClient>` (not a Mongoose
 * connection). Cached on `globalThis` so dev hot-reload doesn't open a new
 * connection on every edit.
 */
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  console.warn("Failed to set DNS servers:", e);
}


const globalForMongo = globalThis as typeof globalThis & {
  _mongoClientPromise?: Promise<MongoClient>;
};

const uri = process.env.MONGODB_URI as string;

if (!uri) {
  throw new Error("MONGODB_URI must be set");
}

function getClientPromise(): Promise<MongoClient> {
  if (process.env.NODE_ENV === "development") {
    if (!globalForMongo._mongoClientPromise) {
      const client = new MongoClient(uri);
      globalForMongo._mongoClientPromise = client.connect().catch((err) => {
        globalForMongo._mongoClientPromise = undefined;
        throw err;
      });
    }
    return globalForMongo._mongoClientPromise;
  } else {
    return new MongoClient(uri).connect();
  }
}

// Create a dynamic proxy promise that forwards calls to the latest active client promise.
// This prevents Next.js or Auth.js from holding onto a permanently rejected promise on initial failure.
const clientPromise = new Proxy(Promise.resolve(), {
  get(target, prop, receiver) {
    const activePromise = getClientPromise();
    if (prop === "then" || prop === "catch" || prop === "finally") {
      const value = activePromise[prop];
      return typeof value === "function" ? value.bind(activePromise) : value;
    }
    return Reflect.get(activePromise, prop, receiver);
  }
}) as unknown as Promise<MongoClient>;

export default clientPromise;
