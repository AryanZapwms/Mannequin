import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not logged in" });

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  const { data: rpcResult, error: rpcError } = await supabase.rpc("is_admin");

  return NextResponse.json({
    user: user,
    profile: profile,
    is_admin_rpc: rpcResult,
    rpcError,
  });
}
