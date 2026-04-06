"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");

    if (user && user.email === email && user.password === password) {
      localStorage.setItem("isLoggedIn", "true");
      alert("Login successful!");
      router.push("/home");
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 w-[350px] shadow-md">

        <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 mb-4"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 mb-4"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2"
        >
          LOGIN
        </button>

        <p className="text-sm mt-4 text-center">
          No account?{" "}
          <Link href="/signup" className="text-blue-500">
            Sign up
          </Link>
        </p>

      </div>
    </div>
  );
}