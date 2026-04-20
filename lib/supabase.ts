import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "dress-app-auth",
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// auto-clear invalid/expired tokens to prevent refresh token errors
if (typeof window !== "undefined") {
  supabase.auth.onAuthStateChange((event) => {
    if (event === "TOKEN_REFRESHED") return;
    if (event === "SIGNED_OUT") {
      localStorage.removeItem("dress-app-auth");
    }
  });

  supabase.auth.getSession().then(({ error }) => {
    if (error?.message?.toLowerCase().includes("refresh token")) {
      localStorage.removeItem("dress-app-auth");
      supabase.auth.signOut();
    }
  });
}
