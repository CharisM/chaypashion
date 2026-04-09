"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiUser, FiPhone, FiMapPin, FiEye, FiEyeOff } from "react-icons/fi";

export default function Signup() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [number, setNumber] = useState("");
  const [location, setLocation] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = () => {
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    const user = { username, email, number, location, password };
    localStorage.setItem("user", JSON.stringify(user));
    alert("Account created!");
    router.push("/login");
  };

  return (
    <div
      className="flex items-center justify-center h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/BG.jpg')" }}
    >
      {/* DARK OVERLAY */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* SIGNUP CARD */}
      <div className="relative bg-white/30 backdrop-blur-xl border border-white/30 p-5 w-[300px] md:w-[340px] shadow-2xl rounded-3xl z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center text-gray-800">
          Sign Up
        </h2>
        <p className="text-center text-white-500 mb-5">
          Create your account to start shopping.
        </p>

        {/* USERNAME */}
        <div className="flex items-center border-b border-white/50 mb-3 py-2 px-3 focus-within:border-white/80 transition rounded-md bg-white/20 backdrop-blur-md">
          <FiUser className="text-black-200 mr-2 text-lg" />
          <input
            type="text"
            placeholder="Username"
            className="w-full outline-none bg-transparent text-black placeholder-black-300"
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        {/* EMAIL */}
        <div className="flex items-center border-b border-white/50 mb-3 py-2 px-3 focus-within:border-white/80 transition rounded-md bg-white/20 backdrop-blur-md">
          <FiMail className="text-black-200 mr-2 text-lg" />
          <input
            type="email"
            placeholder="Email"
            className="w-full outline-none bg-transparent text-black placeholder-black-300"
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {/* PHONE NUMBER */}
        <div className="flex items-center border-b border-white/50 mb-3 py-2 px-3 focus-within:border-white/80 transition rounded-md bg-white/20 backdrop-blur-md">
          <FiPhone className="text-black-200 mr-2 text-lg" />
          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full outline-none bg-transparent text-black placeholder-black-300"
            onChange={(e) => setNumber(e.target.value)}
          />
        </div>

       
        {/* PASSWORD */}
        <div className="flex items-center border-b border-white/50 mb-3 py-2 px-3 focus-within:border-white/80 transition rounded-md bg-white/20 backdrop-blur-md">
          <FiLock className="text-black-200 mr-2 text-lg" />
          <input
            type="password"
            placeholder="Password"
            className="w-full outline-none bg-transparent text-black placeholder-black-300"
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="flex items-center border-b border-white/50 mb-5 py-2 px-3 focus-within:border-white/80 transition rounded-md bg-white/20 backdrop-blur-md">
          <FiLock className="text-black-200 mr-2 text-lg" />
          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full outline-none bg-transparent text-black placeholder-black-300"
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>
        {/* SIGNUP BUTTON */}
        <button
          onClick={handleSignup}
          className="w-full flex items-center justify-center bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition font-semibold shadow-lg"
        >
          <FiLock className="mr-2" /> SIGN UP
        </button>

        {/* LOGIN LINK */}
        <p className="text-sm mt-4 text-center text-white-300">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}