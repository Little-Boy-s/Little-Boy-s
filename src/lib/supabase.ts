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
// Dynamic helper to update both REST and Storage headers safely since Supabase deep-copies options at init time
export function setSupabaseAdminKey(key: string) {
  if (!supabase) return;
  
  const restHeaders = (supabase as any).rest?.headers;
  if (restHeaders) {
    if (typeof restHeaders.set === "function") {
      restHeaders.set("x-admin-key", key);
    } else {
      restHeaders["x-admin-key"] = key;
    }
  }
  
  const storageHeaders = (supabase as any).storage?.headers;
  if (storageHeaders) {
    if (typeof storageHeaders.set === "function") {
      storageHeaders.set("x-admin-key", key);
    } else {
      storageHeaders["x-admin-key"] = key;
    }
  }
}
// Auto-restore admin key from sessionStorage on initial load/refresh
if (typeof window !== "undefined") {
  const savedKey = sessionStorage.getItem("admin_key");
  if (savedKey) {
    // Run after initialization completes
    setTimeout(() => {
      setSupabaseAdminKey(savedKey);
    }, 0);
  }
}
