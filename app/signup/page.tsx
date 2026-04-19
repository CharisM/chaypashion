"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiMail, FiLock, FiUser, FiPhone, FiCheckCircle, FiEye, FiEyeOff } from "react-icons/fi";
import { supabase } from "@/lib/supabase";

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
  const [showOtp, setShowOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const strength = getPasswordStrength(password);

  const handleSignup = async () => {
    setError("");
    if (!username || !email || !password) { setError("Please fill in all fields."); return; }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address."); return;
    }

    // Phone validation — must be 11 digits starting with 09
    if (number && !/^09\d{9}$/.test(number)) {
      setError("Phone number must be 11 digits starting with 09 (e.g. 09123456789).");
      return;
    }

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
      await supabase.from("profiles").upsert({
        id: data.user.id,
        username,
        email,
        phone: number,
      });
    }

    setConfirmed(false);
    setShowOtp(true);
  };

  const handleVerifyOtp = async () => {
    setOtpError("");
    if (otp.length !== 6) { setOtpError("Please enter the 6-digit code."); return; }
    setOtpLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: "signup",
    });
    setOtpLoading(false);
    if (verifyError) { setOtpError("Invalid or expired code. Please try again."); return; }
    setConfirmed(true);
  };

  if (showOtp && !confirmed) return (
    <div className="flex items-center justify-center h-screen bg-cover bg-center relative" style={{ backgroundImage: "url('/BG.jpg')" }}>
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white/30 backdrop-blur-xl border border-white/30 p-8 w-[340px] shadow-2xl rounded-3xl z-10 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
          <FiMail className="text-blue-500 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter OTP Code</h2>
        <p className="text-sm text-gray-700 mb-1">We sent a 6-digit code to:</p>
        <p className="text-sm font-bold text-black bg-white/50 rounded-xl px-4 py-2 mb-5">{email}</p>
        <input
          type="text"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          placeholder="000000"
          className="w-full text-center text-2xl font-bold tracking-[0.5em] border-2 border-white/50 bg-white/20 backdrop-blur-md rounded-xl py-3 px-4 outline-none focus:border-black transition mb-3 text-black placeholder-gray-400"
        />
        {otpError && <p className="text-red-500 text-xs mb-3">{otpError}</p>}
        <button
          onClick={handleVerifyOtp}
          disabled={otpLoading}
          className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition font-semibold text-sm disabled:opacity-50 mb-3"
        >
          {otpLoading ? "Verifying..." : "Verify Code"}
        </button>
        <p className="text-xs text-gray-500">Didn't receive it? Check your spam folder.</p>
      </div>
    </div>
  );

  if (confirmed) return (
    <div
      className="flex items-center justify-center h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/BG.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-white/30 backdrop-blur-xl border border-white/30 p-8 w-[340px] shadow-2xl rounded-3xl z-10 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <FiCheckCircle className="text-green-500 text-3xl" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Check Your Email!</h2>
        <p className="text-sm text-gray-700 mb-2">We sent a confirmation link to:</p>
        <p className="text-sm font-bold text-black bg-white/50 rounded-xl px-4 py-2 mb-5">{email}</p>
        <p className="text-xs text-gray-600 mb-6">Click the link in your email to activate your account before logging in.</p>
        <button onClick={() => router.push("/login")} className="w-full bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition font-semibold text-sm">
          Go to Login
        </button>
        <p className="text-xs text-gray-500 mt-4">Didn't receive it? Check your spam folder.</p>
      </div>
    </div>
  );

  return (
    <div
      className="flex items-center justify-center h-screen bg-cover bg-center relative"
      style={{ backgroundImage: "url('/BG.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/20"></div>

      <div className="relative bg-white/30 backdrop-blur-xl border border-white/30 p-5 w-[300px] md:w-[340px] shadow-2xl rounded-3xl z-10">
        <h2 className="text-2xl md:text-3xl font-bold mb-3 text-center text-gray-800">Sign Up</h2>
        <p className="text-center text-gray-600 mb-5 text-sm">Create your account to start shopping.</p>

        {/* USERNAME */}
        <div className="flex items-center border-b border-white/50 mb-3 py-2 px-3 rounded-md bg-white/20 backdrop-blur-md">
          <FiUser className="mr-2 text-lg shrink-0" />
          <input type="text" placeholder="Username" className="w-full outline-none bg-transparent text-black placeholder-gray-500 text-sm" onChange={(e) => setUsername(e.target.value)} />
        </div>

        {/* EMAIL */}
        <div className="mb-3">
          <div className="flex items-center border-b border-white/50 py-2 px-3 rounded-md bg-white/20 backdrop-blur-md">
            <FiMail className="mr-2 text-lg shrink-0" />
            <input type="email" placeholder="Email" className="w-full outline-none bg-transparent text-black placeholder-gray-500 text-sm" onChange={(e) => setEmail(e.target.value)} />
          </div>
          {email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <p className="text-red-500 text-[10px] mt-1 px-1">Please enter a valid email address</p>
          )}
          {email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && (
            <p className="text-green-600 text-[10px] mt-1 px-1">✓ Valid email</p>
          )}
        </div>

        {/* PHONE */}
        <div className="mb-3">
          <div className="flex items-center border-b border-white/50 py-2 px-3 rounded-md bg-white/20 backdrop-blur-md">
            <FiPhone className="mr-2 text-lg shrink-0" />
            <input
              type="tel"
              placeholder="Phone (09XXXXXXXXX)"
              maxLength={11}
              className="w-full outline-none bg-transparent text-black placeholder-gray-500 text-sm"
              onChange={(e) => setNumber(e.target.value)}
            />
          </div>
          {number && !/^09\d{9}$/.test(number) && (
            <p className="text-red-500 text-[10px] mt-1 px-1">Must be 11 digits starting with 09</p>
          )}
          {number && /^09\d{9}$/.test(number) && (
            <p className="text-green-600 text-[10px] mt-1 px-1">✓ Valid phone number</p>
          )}
        </div>

        {/* PASSWORD */}
        <div className="mb-1">
          <div className="flex items-center border-b border-white/50 py-2 px-3 rounded-md bg-white/20 backdrop-blur-md">
            <FiLock className="mr-2 text-lg shrink-0" />
            <input type={showPassword ? "text" : "password"} placeholder="Password" className="w-full outline-none bg-transparent text-black placeholder-gray-500 text-sm" onChange={(e) => setPassword(e.target.value)} />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-2 text-gray-500 hover:text-black transition shrink-0">
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {strength && (
            <div className="mt-1.5 px-1">
              <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
              </div>
              <p className={`text-[10px] mt-0.5 font-semibold ${
                strength.label === "Weak" ? "text-red-500" :
                strength.label === "Fair" ? "text-orange-400" :
                strength.label === "Good" ? "text-yellow-500" : "text-green-600"
              }`}>{strength.label} password</p>
            </div>
          )}
        </div>

        {/* CONFIRM PASSWORD */}
        <div className="flex items-center border-b border-white/50 mb-4 mt-2 py-2 px-3 rounded-md bg-white/20 backdrop-blur-md">
          <FiLock className="mr-2 text-lg shrink-0" />
          <input type={showConfirm ? "text" : "password"} placeholder="Confirm Password" className="w-full outline-none bg-transparent text-black placeholder-gray-500 text-sm" onChange={(e) => setConfirmPassword(e.target.value)} />
          <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="ml-2 text-gray-500 hover:text-black transition shrink-0">
            {showConfirm ? <FiEyeOff /> : <FiEye />}
          </button>
        </div>

        {error && (
          <div className="mb-3 text-center">
            <p className="text-red-500 text-xs">{error}</p>
            {error.includes("already registered") && (
              <Link href="/login" className="text-blue-400 text-xs hover:underline mt-1 inline-block">Go to Login →</Link>
            )}
          </div>
        )}

        <button
          onClick={handleSignup}
          disabled={loading}
          className="w-full flex items-center justify-center bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition font-semibold shadow-lg disabled:opacity-50 text-sm"
        >
          <FiLock className="mr-2" /> {loading ? "Creating Account..." : "SIGN UP"}
        </button>

        <p className="text-sm mt-4 text-center text-gray-700">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-400 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  );
}
