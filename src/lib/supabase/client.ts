import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Client-side Supabase instance. Safe to use in "use client" components
 * (uploads, realtime, client-side reads that respect RLS as the anon role).
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
