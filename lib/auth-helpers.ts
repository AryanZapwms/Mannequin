import { auth } from "@/auth";

/**
 * Returns the current session user (or null), with `id` always being the
 * Mongo ObjectId string — never `token.sub`.
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Throws if there is no authenticated user with role "admin" or "staff".
 * Use for: products, orders, categories, blogs, reviews admin actions.
 */
export async function requireStaff() {
  const user = await getCurrentUser();
  if (!user || (user.role !== "admin" && user.role !== "staff")) {
    throw new Error("Forbidden: staff or admin access required");
  }
  return user;
}

/**
 * Throws if there is no authenticated user with role "admin".
 * Use for: users and settings admin actions.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    throw new Error("Forbidden: admin access required");
  }
  return user;
}
