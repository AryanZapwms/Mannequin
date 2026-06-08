import { SignUpForm } from "@/components/sign-up-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (user) {
    const params = await searchParams;
    const nextUrl = typeof params?.next === 'string' ? params.next : undefined;
    
    if (nextUrl) {
      redirect(nextUrl);
    } else {
      let role = user.user_metadata?.role ?? "customer";
      if (!role || role === "customer") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();
        if (profile?.role) {
          role = profile.role;
        }
      }
      redirect(role === "admin" || role === "staff" ? "/admin" : "/account");
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <SignUpForm />
      </div>
    </div>
  );
}
