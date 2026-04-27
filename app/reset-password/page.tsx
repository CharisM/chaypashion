"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiLock, FiEye, FiEyeOff, FiArrowRight, FiCheckCircle } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const getStrength = (pw: string) => {
  if (pw.length === 0) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const STRENGTH_LABEL = ["", "Weak", "Fair", "Good", "Strong"];
const STRENGTH_COLOR = ["", "bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-green-500"];
const STRENGTH_TEXT  = ["", "text-red-400", "text-orange-400", "text-yellow-400", "text-green-400"];

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);

  const strength = getStrength(password);

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setReady(true);
    });
  }, []);

  const handleReset = async () => {
    setError("");
    if (!password || !confirmPassword) { setError("Please fill in all fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (updateError) { setError(updateError.message); return; }
    setDone(true);
    setTimeout(() => router.replace("/login"), 3000);
  };

  if (!ready) return (
    <div className="h-screen flex items-center justify-center bg-[#111111]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-[#c9a98a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-white/40 text-sm">Verifying reset link...</p>
      </div>
    </div>
  );

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0a]">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/BG.jpg')" }} />
        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10">
          <span className="text-white font-serif italic text-xl">Chay Fashion</span>
        </div>

        <div className="relative z-10 space-y-10">
          {/* STEP INDICATORS */}
          <div className="space-y-4">
            {[
              { label: "Enter Email", sub: "Provide your registered email" },
              { label: "Check Inbox", sub: "Open the link we sent you" },
              { label: "All Done", sub: "Set your new password" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                  i < 2 ? "bg-[#c9a98a] border-[#c9a98a] text-black" :
                  done ? "bg-[#c9a98a] border-[#c9a98a] text-black" :
                  "bg-white/10 border-[#c9a98a] text-[#c9a98a]"
                }`}>
                  {i < 2 || done ? "✓" : "3"}
                </div>
                <div>
                  <p className={`text-sm font-semibold ${i < 2 ? "text-[#c9a98a]" : "text-white"}`}>{s.label}</p>
                  <p className="text-[11px] text-white/20">{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-[#c9a98a] text-xs tracking-[0.4em] uppercase font-medium">Almost There</span>
            <h1 className="text-4xl font-bold text-white mt-3 leading-tight">
              Set Your<br />
              <span className="text-[#c9a98a]">New</span><br />
              Password.
            </h1>
            <p className="text-white/30 text-sm mt-4 leading-relaxed max-w-sm">
              Choose a strong password to keep your Chay Fashion account secure.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="text-white/20 text-xs">© 2026 Chay Fashion. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 bg-[#111111] relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#c9a98a]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10">

          {/* MOBILE LOGO */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <span className="text-white font-serif italic text-lg">Chay Fashion</span>
          </div>

          {/* MOBILE STEP BAR */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            {[0, 1, 2].map((i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= 2 ? "bg-[#c9a98a]" : "bg-white/10"}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* SUCCESS STATE */}
            {done ? (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                  className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6"
                >
                  <FiCheckCircle className="text-green-400 text-3xl" />
                </motion.div>
                <h2 className="text-3xl font-bold text-white mb-2">Password Updated!</h2>
                <p className="text-white/40 text-sm mb-8">Your password has been changed successfully. Redirecting you to login...</p>
                <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 3, ease: "linear" }}
                    className="h-full bg-[#c9a98a] rounded-full"
                  />
                </div>
                <p className="text-white/20 text-xs mt-3">Redirecting in 3 seconds...</p>
                <Link href="/login" className="mt-6 inline-flex items-center gap-2 text-[#c9a98a] text-sm hover:underline">
                  Go to Login now <FiArrowRight />
                </Link>
              </motion.div>
            ) : (

              /* FORM STATE */
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#c9a98a]/10 border border-[#c9a98a]/20 flex items-center justify-center mb-5">
                    <FiLock className="text-[#c9a98a] text-xl" />
                  </div>
                  <p className="text-[#c9a98a] text-xs tracking-[0.3em] uppercase font-medium mb-1">Step 3 of 3</p>
                  <h2 className="text-3xl font-bold text-white">New password</h2>
                  <p className="text-white/40 text-sm mt-2">Choose a strong password for your account.</p>
                </div>

                {/* PASSWORD FIELD */}
                <div className="mb-4">
                  <label className="text-xs text-white/40 uppercase tracking-widest font-medium mb-2 block">New Password</label>
                  <div className={`flex items-center bg-white/5 border rounded-xl px-4 py-3.5 transition ${error && !password ? "border-red-500/40" : "border-white/10 focus-within:border-[#c9a98a]/50"}`}>
                    <FiLock className="text-white/30 mr-3 shrink-0" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setError(""); }}
                      className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none"
                      autoFocus
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 text-white/20 hover:text-white/60 transition shrink-0">
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>

                  {/* STRENGTH METER */}
                  {password.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= strength ? STRENGTH_COLOR[strength] : "bg-white/10"}`} />
                        ))}
                      </div>
                      <p className={`text-[11px] font-medium ${STRENGTH_TEXT[strength]}`}>{STRENGTH_LABEL[strength]}</p>
                    </motion.div>
                  )}
                </div>

                {/* CONFIRM FIELD */}
                <div className="mb-6">
                  <label className="text-xs text-white/40 uppercase tracking-widest font-medium mb-2 block">Confirm Password</label>
                  <div className={`flex items-center bg-white/5 border rounded-xl px-4 py-3.5 transition ${
                    confirmPassword && password !== confirmPassword ? "border-red-500/40" :
                    confirmPassword && password === confirmPassword ? "border-green-500/30" :
                    "border-white/10 focus-within:border-[#c9a98a]/50"
                  }`}>
                    <FiLock className="text-white/30 mr-3 shrink-0" />
                    <input
                      type={showConfirm ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleReset()}
                      className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none"
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="ml-2 text-white/20 hover:text-white/60 transition shrink-0">
                      {showConfirm ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-red-400 text-xs mt-1.5 pl-1">Passwords do not match</p>
                  )}
                  {confirmPassword && password === confirmPassword && (
                    <p className="text-green-400 text-xs mt-1.5 pl-1 flex items-center gap-1"><FiCheckCircle /> Passwords match</p>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5">
                      <p className="text-red-400 text-xs text-center">{error}</p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  onClick={handleReset}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-[#c9a98a] hover:bg-[#b8956f] text-black py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition disabled:opacity-50 group"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    : <><span>Update Password</span><FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>
                  }
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
