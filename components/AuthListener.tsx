"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthListener() {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" && !session) {
        supabase.auth.signOut();
      }
    });

    // Clear stale session on mount if refresh token is invalid
    supabase.auth.getSession().then(({ error }) => {
      if (error?.message?.includes("Refresh Token Not Found")) {
        supabase.auth.signOut();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
