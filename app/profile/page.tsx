"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiUser, FiMail, FiPhone, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import Link from "next/link";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ username: string; phone: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingUsername, setEditingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [savingUsername, setSavingUsername] = useState(false);
  const [usernameError, setUsernameError] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTimeout(() => router.push("/login"), 0); return; }
      if (user.email === "chayfashion.admin@gmail.com") { router.replace("/admin"); return; }
      const { data } = await supabase.from("profiles").select("username, phone, email").eq("id", user.id).maybeSingle();
      setProfile(data);
      setLoading(false);
    };
    getProfile();
  }, []);

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) return;
    setSavingUsername(true);
    setUsernameError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ username: newUsername.trim() }).eq("id", user.id);
    setSavingUsername(false);
    if (error) { setUsernameError("Failed to save."); return; }
    setProfile(prev => prev ? { ...prev, username: newUsername.trim() } : prev);
    setEditingUsername(false);
  };


  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      <Navbar />

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
      {loading ? (
        <div className="flex items-center justify-center py-32">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
      <div className="max-w-2xl mx-auto px-6 pt-20 pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
          <h1 className="text-2xl font-bold">{profile?.username ?? "User"}</h1>
          <span className="inline-block mt-1 text-xs tracking-widest uppercase bg-black text-white px-3 py-1">Member</span>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white shadow-sm rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b">
            <p className="text-xs tracking-[0.2em] uppercase text-gray-400 font-medium">Account Details</p>
          </div>
          <div className="divide-y">
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <FiUser className="text-gray-500 text-sm" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-400 mb-0.5">Username</p>
                {editingUsername ? (
                  <div className="flex items-center gap-2">
                    <input
                      autoFocus
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      onKeyDown={e => { if (e.key === "Enter") handleSaveUsername(); if (e.key === "Escape") setEditingUsername(false); }}
                      className="text-sm font-semibold border-b border-black outline-none bg-transparent flex-1"
                    />
                    <button onClick={handleSaveUsername} disabled={savingUsername} className="text-green-600 hover:text-green-700">
                      <FiCheck size={16} />
                    </button>
                    <button onClick={() => setEditingUsername(false)} className="text-gray-400 hover:text-gray-600">
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold">{profile?.username ?? "—"}</p>
                    <button onClick={() => { setNewUsername(profile?.username ?? ""); setUsernameError(""); setEditingUsername(true); }} className="text-gray-400 hover:text-black transition">
                      <FiEdit2 size={13} />
                    </button>
                  </div>
                )}
                {usernameError && <p className="text-red-500 text-xs mt-1">{usernameError}</p>}
              </div>
            </div>
            <div className="flex items-center gap-4 px-6 py-5">
              <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <FiMail className="text-gray-500 text-sm" />
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Email Address</p>
                <p className="text-sm font-semibold">{profile?.email || "—"}</p>
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
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <Link href="/edit-profile" className="mt-6 w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition font-semibold text-sm">
            Edit Profile
          </Link>
        </motion.div>
      </div>
      )}
    </div>
  );
}
