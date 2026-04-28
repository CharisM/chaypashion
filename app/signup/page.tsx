"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiUser, FiPhone, FiCheckCircle, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

const getPasswordStrength = (pw: string) => {
  if (pw.length === 0) return null;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
  if (score === 2) return { label: "Fair", color: "bg-orange-400", width: "w-2/4" };
  if (score === 3) return { label: "Good", color: "bg-yellow-400", width: "w-3/4" };
  return { label: "Strong", color: "bg-green-500", width: "w-full" };
};

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSignup = async () => {
    setError("");
    if (!username || !email || !password) { setError("Please fill in all fields."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    if (number && !/^09\d{9}$/.test(number)) { setError("Phone number must be 11 digits starting with 09 (e.g. 09123456789)."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (strength?.label === "Weak") { setError("Password is too weak. Add uppercase letters, numbers, or symbols."); return; }

    setLoading(true);
    const { data, error: signupError } = await supabase.auth.signUp({ email, password });
    setLoading(false);

    if (signupError) {
      if (signupError.message.toLowerCase().includes("already registered") || signupError.message.toLowerCase().includes("already exists")) {
        setError("This email is already registered. Please login instead.");
      } else {
        setError(signupError.message);
      }
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({ id: data.user.id, username, email, phone: number });
    }

    router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
  };

  // Success Screen
  if (confirmed) return (
    <div className="h-screen flex overflow-hidden bg-[#0a0a0a]">
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
          <span className="text-[#c9a98a] text-xs tracking-[0.4em] uppercase font-medium">Welcome Aboard</span>
          <h1 className="text-5xl font-bold text-white mt-3 leading-tight">You&apos;re All<br /><span className="text-[#c9a98a]">Set</span><br />To Shop.</h1>
        </div>
        <div className="relative z-10">
          <p className="text-white/20 text-xs">© 2026 Chay Fashion. All rights reserved.</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 bg-[#111111]">
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-[400px] text-center">
          <div className="w-16 h-16 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <FiCheckCircle className="text-green-400 text-2xl" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Account Verified!</h2>
          <p className="text-white/40 text-sm mb-2">Your account has been successfully created.</p>
          <p className="text-white text-sm font-semibold bg-white/5 border border-white/10 rounded-xl px-4 py-2 mb-8 inline-block">{email}</p>

          <button onClick={() => router.push("/login")} className="w-full flex items-center justify-center gap-3 bg-[#c9a98a] hover:bg-[#b8956f] text-black py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition group">
            Go to Login <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>

        </motion.div>
      </div>
    </div>
  );

  // Main Signup Form
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
            <span className="text-[#c9a98a] text-xs tracking-[0.4em] uppercase font-medium">Join Us</span>
            <h1 className="text-5xl font-bold text-white mt-3 leading-tight">
              Start Your<br />
              <span className="text-[#c9a98a]">Fashion</span><br />
              Journey.
            </h1>
            <p className="text-white/40 text-sm mt-6 leading-relaxed max-w-sm">
              Create an account and explore the latest styles, exclusive deals, and seamless shopping.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.3 }} className="flex gap-8 mt-12">
            {[
              { label: "Free Signup", desc: "No hidden fees" },
              { label: "Order Tracking", desc: "Real-time updates" },
              { label: "Exclusive Deals", desc: "Members only" },
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
        <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }} className="w-full max-w-[400px]">

          {/* MOBILE LOGO */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
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

          <div className="mb-5">
            <h2 className="text-2xl font-bold text-white">Create account</h2>
            <p className="text-white/40 text-xs mt-1">Sign up to start shopping</p>
          </div>

          {/* USERNAME */}
          <div className="mb-2.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-medium mb-1 block">Username</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#c9a98a]/50 transition">
              <FiUser className="text-white/30 mr-2.5 shrink-0 text-sm" />
              <input type="text" placeholder="Your name" onChange={(e) => setUsername(e.target.value)} className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none" />
            </div>
          </div>

          {/* EMAIL */}
          <div className="mb-2.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-medium mb-1 block">Email Address</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#c9a98a]/50 transition">
              <FiMail className="text-white/30 mr-2.5 shrink-0 text-sm" />
              <input type="email" placeholder="you@example.com" onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none" />
            </div>
            {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <p className="text-red-400 text-[10px] mt-0.5 px-1">Please enter a valid email address</p>}
            {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && <p className="text-green-400 text-[10px] mt-0.5 px-1">✓ Valid email</p>}
          </div>

          {/* PHONE */}
          <div className="mb-2.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-medium mb-1 block">Phone <span className="normal-case text-white/20">(optional)</span></label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#c9a98a]/50 transition">
              <FiPhone className="text-white/30 mr-2.5 shrink-0 text-sm" />
              <input type="tel" placeholder="09XXXXXXXXX" maxLength={11} onChange={(e) => setNumber(e.target.value)} className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none" />
            </div>
            {number && !/^09\d{9}$/.test(number) && <p className="text-red-400 text-[10px] mt-0.5 px-1">Must be 11 digits starting with 09</p>}
            {number && /^09\d{9}$/.test(number) && <p className="text-green-400 text-[10px] mt-0.5 px-1">✓ Valid phone number</p>}
          </div>

          {/* PASSWORD */}
          <div className="mb-2.5">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-medium mb-1 block">Password</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#c9a98a]/50 transition">
              <FiLock className="text-white/30 mr-2.5 shrink-0 text-sm" />
              <input type={showPassword ? "text" : "password"} placeholder="••••••••" onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 text-white/20 hover:text-white/60 transition shrink-0">
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            {strength && (
              <div className="mt-1.5 px-1">
                <div className="h-0.5 w-full bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                </div>
                <p className={`text-[10px] mt-0.5 font-semibold ${strength.label === "Weak" ? "text-red-400" : strength.label === "Fair" ? "text-orange-400" : strength.label === "Good" ? "text-yellow-400" : "text-green-400"}`}>
                  {strength.label} password
                </p>
              </div>
            )}
          </div>

          {/* CONFIRM PASSWORD */}
          <div className="mb-4">
            <label className="text-[10px] text-white/40 uppercase tracking-widest font-medium mb-1 block">Confirm Password</label>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 focus-within:border-[#c9a98a]/50 transition">
              <FiLock className="text-white/30 mr-2.5 shrink-0 text-sm" />
              <input type={showConfirm ? "text" : "password"} placeholder="••••••••" onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-transparent text-white placeholder-white/20 text-sm outline-none" />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="ml-2 text-white/20 hover:text-white/60 transition shrink-0">
                {showConfirm ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5 mb-3 text-center">
              <p className="text-red-400 text-xs">{error}</p>
              {error.includes("already registered") && (
                <Link href="/login" className="text-[#c9a98a] text-xs hover:underline mt-1 inline-block">Go to Login →</Link>
              )}
            </motion.div>
          )}

          <button onClick={handleSignup} disabled={loading} className="w-full flex items-center justify-center gap-3 bg-[#c9a98a] hover:bg-[#b8956f] text-black py-3 rounded-xl font-bold text-sm tracking-widest uppercase transition disabled:opacity-50 group">
            {loading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <><span>Create Account</span><FiArrowRight className="group-hover:translate-x-1 transition-transform" /></>}
          </button>

          <div className="mt-5 pt-5 border-t border-white/5 text-center">
            <p className="text-white/30 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-[#c9a98a] hover:text-[#b8956f] transition font-semibold">Sign in</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
