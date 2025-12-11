import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login?next=/admin");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, role, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  const role = (profile?.role as string | null) ?? (user.user_metadata?.role as string | null) ?? "customer";

  if (role !== "admin" && role !== "staff") {
    redirect("/");
  }

  const displayName =
    (profile?.display_name as string | null) ||
    (user.user_metadata?.full_name as string | null) ||
    user.email ||
    "Admin";

  async function signOut() {
    "use server";
    const serverClient = await createClient();
    await serverClient.auth.signOut();
  }

  return (
    <AdminShell
      displayName={displayName}
      email={user.email ?? ""}
      avatarUrl={(profile?.avatar_url as string | undefined) ?? (user.user_metadata?.avatar_url as string | undefined)}
      onSignOut={signOut}
    >
      {children}
    </AdminShell>
  );
}
