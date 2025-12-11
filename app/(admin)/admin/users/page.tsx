import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateUserRole } from "./actions";
import Image from "next/image";

export default async function UsersPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, display_name, role, avatar_url, metadata")
    .order("created_at", { ascending: false });

  const profiles = data ?? [];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Users</h1>
        <p className="text-sm text-muted-foreground">Manage roles and review profile details.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Accounts</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {profiles.length === 0 ? (
            <p className="text-sm text-muted-foreground">No users found.</p>
          ) : (
            profiles.map((profile) => {
              const email = (profile.metadata as Record<string, unknown> | null)?.email as string | undefined;
              return (
                <div key={profile.id} className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 overflow-hidden rounded-full bg-primary/10">
                      {profile.avatar_url ? (
                        <Image src={profile.avatar_url} alt={profile.display_name ?? "User"} width={48} height={48} className="h-full w-full object-cover" unoptimized />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-sm font-semibold">
                          {(profile.display_name ?? email ?? "U").charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{profile.display_name ?? email ?? "User"}</p>
                      <p className="text-xs text-muted-foreground">{email ?? profile.id}</p>
                    </div>
                  </div>
                  <form action={updateUserRole} className="flex items-center gap-3">
                    <input type="hidden" name="profileId" value={profile.id} />
                    <Label htmlFor={`role-${profile.id}`} className="text-xs uppercase tracking-wide text-muted-foreground">
                      Role
                    </Label>
                    <select
                      id={`role-${profile.id}`}
                      name="role"
                      defaultValue={profile.role ?? "customer"}
                      className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="customer">Customer</option>
                      <option value="staff">Staff</option>
                      <option value="admin">Admin</option>
                    </select>
                    <Button type="submit" size="sm">
                      Update
                    </Button>
                  </form>
                </div>
              );
            })
          )}
        </CardContent>
      </Card>
    </section>
  );
}
