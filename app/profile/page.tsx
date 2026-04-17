"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiUser, FiMail, FiPhone, FiArrowLeft } from "react-icons/fi";
import Link from "next/link";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ username: string; phone: string } | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTimeout(() => router.push("/login"), 0); return; }
      setEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("username, phone").eq("id", user.id).single();
      setProfile(data);
    };
    getProfile();
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
        <Link href="/" className="text-3xl font-serif italic">Chay Fashion</Link>
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition">
          <FiArrowLeft /> Back
        </button>
      </nav>

      {/* HERO BANNER */}
      <div className="bg-black h-40 w-full relative">
        <div className="absolute inset-0 opacity-20 bg-[url('/BG.jpg')] bg-cover bg-center" />
        <div className="relative flex items-end px-16 h-full pb-0">
          <div className="translate-y-1/2 flex items-end gap-6">
            <div className="w-24 h-24 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
                <FiUser className="text-white text-4xl" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-2xl mx-auto px-6 pt-20 pb-16">

        {/* NAME & BADGE */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{profile?.username ?? "User"}</h1>
          <span className="inline-block mt-1 text-xs tracking-widest uppercase bg-black text-white px-3 py-1">Member</span>
        </div>

        {/* INFO CARD */}
        <div className="bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b">
            <p className="text-xs tracking-[0.2em] uppercase text-gray-400 font-medium">Account Details</p>
          </div>

          <div className="divide-y">
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <FiUser className="text-gray-500 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Username</p>
                <p className="text-sm font-semibold">{profile?.username ?? "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <FiMail className="text-gray-500 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Email Address</p>
                <p className="text-sm font-semibold">{email || "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <FiPhone className="text-gray-500 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Phone Number</p>
                <p className="text-sm font-semibold">{profile?.phone ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
