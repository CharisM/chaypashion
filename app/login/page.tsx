"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock } from "react-icons/fi";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (user && user.email === email && user.password === password) {
      localStorage.setItem("isLoggedIn", "true");
      alert("Login successful!");
      router.push("/");
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <div
      className="h-screen bg-cover bg-center flex items-center justify-center relative"
      style={{ backgroundImage: "url('/BG.jpg')" }}
    >
      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* LOGIN CARD */}
      <div className="relative bg-white/30 backdrop-blur-xl border border-white/30 p-8 w-[360px] md:w-[400px] shadow-2xl rounded-3xl z-10 transition-all duration-300">
        <h2 className="text-3xl font-bold mb-3 text-center text-gray-800">
          Welcome!
        </h2>
        <p className="text-center text-white-500 mb-6">
          Login to continue shopping.
        </p>

        {/* EMAIL */}
        <div className="flex items-center border-b border-white/50 mb-4 py-2 px-3 focus-within:border-white/80 transition rounded-md bg-white/20 backdrop-blur-md">
          <FiMail className="text-gray-200 mr-2 text-lg" />
          <input
            type="email"
            placeholder="Email"
            className="w-full outline-none bg-transparent text-black placeholder-black-300"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PASSWORD */}
        <div className="flex items-center border-b border-white/50 mb-6 py-2 px-3 focus-within:border-white/80 transition rounded-md bg-white/20 backdrop-blur-md">
          <FiLock className="text-gray-200 mr-2 text-lg" />
          <input
            type="password"
            placeholder="Password"
            className="w-full outline-none bg-transparent text-black placeholder-black-300"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>



        {/* BUTTON */}
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition font-semibold shadow-lg"
        >
          <FiLock className="mr-2" /> LOGIN
        </button>

        {/* SIGNUP */}
        <p className="text-sm mt-5 text-center text-white-600">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-blue-500 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}