"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield, FiArrowRight } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { ADMIN_EMAILS } from "@/lib/orders";
import { motion } from "framer-motion";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    const { data, error: loginError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    setLoading(false);
    if (loginError) { setError("Invalid email or password. Please try again."); return; }
    if (!data.user?.email || !ADMIN_EMAILS.includes(data.user.email)) {
      await supabase.auth.signOut();
      setError("Access denied. This account does not have admin privileges.");
      return;
    }
    window.location.href = "/admin";
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0a]">

      {/* LEFT PANEL */}
      <div className="hidden lg:flex w-1/2 relative flex-col justify-between p-12 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-20" style={{ backgroundImage: "url('/BG.jpg')" }} />
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent" />

        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />

        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#c9a98a] rounded-lg flex items-center justify-center">
              <FiShield className="text-black text-sm font-bold" />
            </div>
            <span className="text-white font-serif italic text-xl">Chay Fashion</span>
          </div>
        </div>

        <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <span className="text-[#c9a98a] text-xs tracking-[0.4em] uppercase font-medium">Admin Portal</span>
            <h1 className="text-5xl font-bold text-white mt-3 leading-tight">
              Manage Your<br />
              <span className="text-[#c9a98a]">Business</span><br />
              With Ease.
            </h1>
            <p className="text-white/40 text-sm mt-6 leading-relaxed max-w-sm">
              Full control over orders, inventory, analytics, and customer management — all in one place.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex gap-8 mt-12"
          >
            {[
              { label: "Orders", desc: "Track & manage" },
              { label: "Inventory", desc: "Stock control" },
              { label: "Analytics", desc: "Sales insights" },
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
            <div className="w-7 h-7 bg-[#c9a98a] rounded-lg flex items-center justify-center">
              <FiShield className="text-black text-xs" />
            </div>
            <span className="text-white font-serif italic text-lg">Chay Fashion</span>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white">Welcome back</h2>
            <p className="text-white/40 text-sm mt-2">Sign in to your admin dashboard</p>
          </div>

          {/* EMAIL */}
          <div className="mb-4">
            <label className="text-xs text-white/40 uppercase tracking-widest font-medium mb-2 block">Email Address</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 focus-within:border-[#c9a98a]/50 transition">
              <FiMail className="text-white/30 mr-3 shrink-0" />
              <input
                type="email"
                placeholder="admin@chayfashion.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none"
              />
            </div>
          </div>

          {/* PASSWORD */}
          <div className="mb-6">
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

          <div className="mt-8 pt-8 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/20 text-xs">Secured & encrypted connection</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
