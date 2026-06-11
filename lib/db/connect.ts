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

const uri: string = (() => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be set");
  }
  return process.env.MONGODB_URI;
})();

const cached = globalForMongoose._mongoose ?? { conn: null, promise: null };
globalForMongoose._mongoose = cached;

export async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
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
