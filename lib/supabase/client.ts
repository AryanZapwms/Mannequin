import { createBrowserClient } from "@supabase/ssr";

const globalForSupabase = globalThis as typeof globalThis & {
  supabase?: ReturnType<typeof createBrowserClient>;
};

export function createClient() {
  if (!globalForSupabase.supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey =
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
    globalForSupabase.supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }

  return globalForSupabase.supabase;
}
