import { supabase } from "@/lib/supabase";

export async function sendOTP(email: string) {
  return await supabase.auth.signInWithOtp({ email });
}

export async function verifyOTP(email: string, token: string) {
  return await supabase.auth.verifyOtp({ email, token, type: "email" });
}
