import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth, signOut as authSignOut } from "@/auth";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const role = user.role ?? "customer";

  if (role !== "admin" && role !== "staff") {
    redirect("/");
  }

  const displayName = user.name || user.email || "Admin";

  async function signOut() {
    "use server";
    await authSignOut();
  }

  return (
    <AdminShell
      displayName={displayName}
      email={user.email ?? ""}
      avatarUrl={user.image ?? undefined}
      onSignOut={signOut}
    >
      {children}
    </AdminShell>
  );
}
