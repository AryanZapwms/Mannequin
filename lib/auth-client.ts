import type { UserRole } from "@/lib/db/models/User";

export interface SessionUser {
  id: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  role?: UserRole;
}

/**
 * Client-side session lookup via the Auth.js session endpoint — avoids
 * requiring a SessionProvider wrapper just to read the current user.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const res = await fetch("/api/auth/session");
  if (!res.ok) return null;
  const session = await res.json();
  return session?.user ?? null;
}
