"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiArrowRight, FiArrowLeft, FiCheckCircle, FiRefreshCw } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Enter Email", "Check Inbox", "All Done"];

export default function ForgotPassword() {
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  const handleSend = async () => {
    setError("");
    if (!email.trim()) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (resetError) { setError(resetError.message); return; }
    setStep(1);
  };

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setResending(false);
    setResent(true);
    setTimeout(() => setResent(false), 4000);
  };

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
            {STEPS.map((label, i) => (
              <motion.div
                key={i}
                animate={{ opacity: i <= step ? 1 : 0.25 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-4"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-500 ${
                  i < step ? "bg-[#c9a98a] border-[#c9a98a] text-black" :
                  i === step ? "bg-white/10 border-[#c9a98a] text-[#c9a98a]" :
                  "bg-white/5 border-white/10 text-white/30"
                }`}>
                  {i < step ? "✓" : i + 1}
                </div>
                <div>
                  <p className={`text-sm font-semibold transition-colors duration-300 ${i === step ? "text-white" : i < step ? "text-[#c9a98a]" : "text-white/30"}`}>
                    {label}
                  </p>
                  <p className="text-[11px] text-white/20">
                    {i === 0 ? "Provide your registered email" : i === 1 ? "Open the link we sent you" : "Set your new password"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-[#c9a98a] text-xs tracking-[0.4em] uppercase font-medium">Account Recovery</span>
            <h1 className="text-4xl font-bold text-white mt-3 leading-tight">
              Reset Your<br />
              <span className="text-[#c9a98a]">Password</span><br />
              Easily.
            </h1>
            <p className="text-white/30 text-sm mt-4 leading-relaxed max-w-sm">
              Follow the steps to securely recover access to your Chay Fashion account.
            </p>
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="text-white/20 text-xs">© 2026 Chay Fashion. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 bg-[#111111] relative overflow-hidden">

        {/* subtle background glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#c9a98a]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-[400px] relative z-10">

          {/* MOBILE LOGO */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <span className="text-white font-serif italic text-lg">Chay Fashion</span>
          </div>

          {/* MOBILE STEP BAR */}
          <div className="flex lg:hidden items-center gap-2 mb-8">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i <= step ? "bg-[#c9a98a]" : "bg-white/10"}`} />
            ))}
          </div>

          <AnimatePresence mode="wait">

            {/* STEP 0 — ENTER EMAIL */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-[#c9a98a]/10 border border-[#c9a98a]/20 flex items-center justify-center mb-5">
                    <FiMail className="text-[#c9a98a] text-xl" />
                  </div>
                  <p className="text-[#c9a98a] text-xs tracking-[0.3em] uppercase font-medium mb-1">Step 1 of 3</p>
                  <h2 className="text-3xl font-bold text-white">Forgot password?</h2>
                  <p className="text-white/40 text-sm mt-2">Enter the email linked to your account and we'll send you a reset link.</p>
                </div>

                <div className="mb-5">
                  <label className="text-xs text-white/40 uppercase tracking-widest font-medium mb-2 block">Email Address</label>
                  <div className={`flex items-center bg-white/5 border rounded-xl px-4 py-3.5 transition ${error ? "border-red-500/40" : "border-white/10 focus-within:border-[#c9a98a]/50"}`}>
                    <FiMail className="text-white/30 mr-3 shrink-0" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none"
                      autoFocus
                    />
                  </div>
                  <AnimatePresence>
                    {error && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs mt-2 pl-1">
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <button
                  onClick={handleSend}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-3 bg-[#c9a98a] hover:bg-[#b8956f] text-black py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition disabled:opacity-50 group"
                >
                  {loading
                    ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    : <><span>Send Reset Link</span><FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>
                  }
                </button>

                <div className="mt-8 pt-8 border-t border-white/5 text-center">
                  <Link href="/login" className="text-white/30 text-sm hover:text-white/60 transition flex items-center justify-center gap-2">
                    <FiArrowLeft className="text-xs" /> Back to Login
                  </Link>
                </div>
              </motion.div>
            )}

            {/* STEP 1 — CHECK INBOX */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-5">
                    <FiMail className="text-blue-400 text-xl" />
                  </div>
                  <p className="text-[#c9a98a] text-xs tracking-[0.3em] uppercase font-medium mb-1">Step 2 of 3</p>
                  <h2 className="text-3xl font-bold text-white">Check your inbox</h2>
                  <p className="text-white/40 text-sm mt-2">We sent a password reset link to:</p>
                </div>

                {/* EMAIL DISPLAY */}
                <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#c9a98a]/10 flex items-center justify-center shrink-0">
                    <FiMail className="text-[#c9a98a] text-sm" />
                  </div>
                  <p className="text-white text-sm font-semibold truncate">{email}</p>
                </div>

                {/* INSTRUCTIONS */}
                <div className="space-y-3 mb-8">
                  {[
                    { num: "1", text: "Open your email inbox" },
                    { num: "2", text: "Find the email from Chay Fashion" },
                    { num: "3", text: "Click the \"Reset Password\" button" },
                  ].map((item) => (
                    <div key={item.num} className="flex items-center gap-3 bg-white/3 rounded-xl px-4 py-3">
                      <span className="w-6 h-6 rounded-full bg-[#c9a98a]/20 text-[#c9a98a] text-xs font-bold flex items-center justify-center shrink-0">{item.num}</span>
                      <p className="text-white/60 text-sm">{item.text}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 text-xs text-white/30 text-center">
                  Didn't receive it? Check your <span className="text-white/50 font-medium">spam or junk folder</span>.
                </div>

                {/* RESEND */}
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 text-white/50 hover:text-white py-3.5 rounded-xl text-sm font-semibold transition disabled:opacity-40 mb-4"
                >
                  {resending
                    ? <><div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin" /> Resending...</>
                    : resent
                    ? <><FiCheckCircle className="text-green-400" /> <span className="text-green-400">Email resent!</span></>
                    : <><FiRefreshCw className="text-sm" /> Resend Email</>
                  }
                </button>

                <div className="text-center">
                  <button onClick={() => { setStep(0); setError(""); }} className="text-white/30 text-sm hover:text-white/60 transition flex items-center justify-center gap-2 mx-auto">
                    <FiArrowLeft className="text-xs" /> Use a different email
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
