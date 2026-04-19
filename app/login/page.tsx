"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { alert(error.message); return; }
    setTimeout(() => router.replace("/"), 100);
  };

  return (
    <div
      className="h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: "url('/BG.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative bg-white/30 backdrop-blur-xl border border-white/30 p-8 w-[360px] md:w-[400px] shadow-2xl rounded-3xl z-10 transition-all duration-300">
        <h2 className="text-3xl font-bold mb-3 text-center text-gray-800">Welcome!</h2>
        <p className="text-center text-gray-600 mb-6 text-sm">Login to continue shopping.</p>

        {/* EMAIL */}
        <div className="flex items-center border-b border-white/50 mb-4 py-2 px-3 focus-within:border-white/80 transition rounded-md bg-white/20 backdrop-blur-md">
          <FiMail className="mr-2 text-lg shrink-0" />
          <input
            type="email"
            placeholder="Email"
            className="w-full outline-none bg-transparent text-black placeholder-gray-500 text-sm"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="flex items-center border-b border-white/50 mb-6 py-2 px-3 focus-within:border-white/80 transition rounded-md bg-white/20 backdrop-blur-md">
          <FiLock className="mr-2 text-lg shrink-0" />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            className="w-full outline-none bg-transparent text-black placeholder-gray-500 text-sm"
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 text-gray-500 hover:text-black transition shrink-0">
            {showPassword ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {/* BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition font-semibold shadow-lg"
        >
          <FiLock className="mr-2" /> LOGIN
        </button>

        <p className="text-sm mt-5 text-center text-gray-700">
          Don't have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
