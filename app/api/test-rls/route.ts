import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not logged in" });

  const { data: is_admin, error } = await supabase.rpc('is_admin');
  
  // also test inserting a dummy category and see if we get the exact RLS error
  const { data: insertData, error: insertError } = await supabase.from('product_categories').insert({
    name: 'test-rls',
    slug: 'test-rls-' + Date.now(),
  }).select();

  return NextResponse.json({
    user_id: user.id,
    is_admin_rpc_result: is_admin,
    is_admin_rpc_error: error,
    insert_error: insertError,
  });
}
