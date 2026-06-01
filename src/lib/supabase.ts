import { createClient } from "@supabase/supabase-js";

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string) || "";
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || "";

export const isSupabaseConfigured = Boolean(
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl !== "https://your-project-id.supabase.co" && 
  supabaseAnonKey !== "your-anon-key"
);

// We define a dynamic getter for headers so Supabase always picks up the latest key
// from sessionStorage at runtime without manual client mutations.
export const supabase = createClient(
  isSupabaseConfigured ? supabaseUrl : "https://towbbiljwcqlyytynytv.supabase.co",
  isSupabaseConfigured ? supabaseAnonKey : "sb_publishable_0ZQIIJWbwjkMAQmvGoAv3Q_B6S4sxZU",
  {
    global: {
      headers: {
        get "x-admin-key"() {
          if (typeof window !== "undefined") {
            return sessionStorage.getItem("admin_key") || "";
          }
          return "";
        }
      }
    }
  }
);
