import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "https://your-project-id.supabase.co" && 
  supabaseAnonKey !== "your-anon-key"
);

// Fallback to placeholder if not configured to prevent instantiation crashes
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://towbbiljwcqlyytynytv.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "sb_publishable_0ZQIIJWbwjkMAQmvGoAv3Q_B6S4sxZU"
);
