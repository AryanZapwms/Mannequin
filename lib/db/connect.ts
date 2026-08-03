import mongoose from "mongoose";
import dns from "node:dns";

// Fix local MongoDB Atlas SRV resolution issues in Node 20+
dns.setServers(["8.8.8.8", "1.1.1.1"]);

/**
 * Cached Mongoose connection singleton — required so Next.js dev hot-reload
 * (and serverless invocations) reuse a single connection instead of opening
 * a new one per request.
 */

const globalForMongoose = globalThis as typeof globalThis & {
  _mongoose?: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
};

const cached = globalForMongoose._mongoose ?? { conn: null, promise: null };
globalForMongoose._mongoose = cached;

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  // Checked at call time, not module load: `next build` imports this file while
  // collecting route data, and CI builds have no database credentials.
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI must be set");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
  return cached.conn;
}
