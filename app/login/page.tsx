"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    setLoading(true);
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (loginError) { setError(loginError.message); return; }
    window.location.href = "/";
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0a]">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/BG.jpg')" }} />
        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white">
              <rect x="20" y="20" width="120" height="120" rx="4" transform="rotate(45 80 80)" stroke="currentColor" strokeWidth="3" fill="none"/>
              <rect x="32" y="32" width="96" height="96" rx="2" transform="rotate(45 80 80)" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.4"/>
              <path d="M58 68 C58 58 68 52 78 52 C86 52 92 56 95 62" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <path d="M58 92 C58 102 68 108 78 108 C86 108 92 104 95 98" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <line x1="58" y1="68" x2="58" y2="92" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <line x1="102" y1="52" x2="102" y2="108" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <line x1="102" y1="52" x2="122" y2="52" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <line x1="102" y1="80" x2="118" y2="80" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <span className="text-white font-serif italic text-xl">Chay Fashion</span>
          </div>
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-[#c9a98a] text-xs tracking-[0.4em] uppercase font-medium">Welcome Back</span>
            <h1 className="text-5xl font-bold text-white mt-3 leading-tight">
              Discover Your<br />
              <span className="text-[#c9a98a]">Perfect</span><br />
              Style.
            </h1>
            <p className="text-white/40 text-sm mt-6 leading-relaxed max-w-sm">
              Shop the latest fashion trends, track your orders, and enjoy a seamless shopping experience.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex gap-8 mt-12"
          >
            {[
              { label: "New Arrivals", desc: "Fresh styles" },
              { label: "Easy Returns", desc: "Hassle-free" },
              { label: "Fast Delivery", desc: "Quick shipping" },
            ].map((f, i) => (
              <div key={i}>
                <p className="text-white font-semibold text-sm">{f.label}</p>
                <p className="text-white/30 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="relative z-10">
          <p className="text-white/20 text-xs">© 2026 Chay Fashion. All rights reserved.</p>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 bg-[#111111]">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-[400px]"
        >
          {/* MOBILE LOGO */}
          <div className="flex lg:hidden items-center gap-2 mb-10">
            <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white">
              <rect x="20" y="20" width="120" height="120" rx="4" transform="rotate(45 80 80)" stroke="currentColor" strokeWidth="3" fill="none"/>
              <rect x="32" y="32" width="96" height="96" rx="2" transform="rotate(45 80 80)" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.4"/>
              <path d="M58 68 C58 58 68 52 78 52 C86 52 92 56 95 62" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <path d="M58 92 C58 102 68 108 78 108 C86 108 92 104 95 98" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
              <line x1="58" y1="68" x2="58" y2="92" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <line x1="102" y1="52" x2="102" y2="108" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <line x1="102" y1="52" x2="122" y2="52" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              <line x1="102" y1="80" x2="118" y2="80" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
            </svg>
            <span className="text-white font-serif italic text-lg">Chay Fashion</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white">Welcome back</h2>
            <p className="text-white/40 text-sm mt-2">Sign in to your account</p>
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="text-xs text-white/40 uppercase tracking-widest font-medium mb-2 block">Email Address</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-[#c9a98a]/50 transition">
              <FiMail className="text-white/30 mr-3 shrink-0" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="mb-2">
            <label className="text-xs text-white/40 uppercase tracking-widest font-medium mb-2 block">Password</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-[#c9a98a]/50 transition">
              <FiLock className="text-white/30 mr-3 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 text-white/20 hover:text-white/60 transition shrink-0">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <Link href="/forgot-password" className="text-xs text-white/30 hover:text-[#c9a98a] transition">Forgot password?</Link>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 mb-5"
            >
              <p className="text-red-400 text-xs text-center">{error}</p>
            </motion.div>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-[#c9a98a] hover:bg-[#b8956f] text-black py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition disabled:opacity-50 group"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <>
                Sign In
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>

          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-white/30 text-sm">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-[#c9a98a] hover:text-[#b8956f] transition font-semibold">Sign up</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
