"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiUser, FiPhone, FiSave } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function EditProfilePage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTimeout(() => router.push("/login"), 0); return; }
      const { data } = await supabase.from("profiles").select("username, phone, email").eq("id", user.id).maybeSingle();
      if (data) { setUsername(data.username ?? ""); setPhone(data.phone ?? ""); }
      setPageLoading(false);
    };
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    const { error: err } = await supabase.from("profiles").update({ username, phone }).eq("id", user.id);
    setLoading(false);
    if (err) { setError("Failed to save. Please try again."); return; }
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push("/profile"); }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
        <Link href="/" className="text-3xl font-serif italic">Chay Fashion</Link>
        <Link href="/profile" className="text-sm text-gray-500 hover:text-black transition">← Back to Profile</Link>
      </nav>

      {pageLoading ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
      <div className="flex justify-center mt-16 px-4 pb-16">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md">

          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mb-3">
              <FiUser className="text-white text-4xl" />
            </div>
            <h2 className="text-2xl font-bold">Edit Profile</h2>
            <p className="text-gray-400 text-sm mt-1">Update your account details</p>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="text-xs tracking-widest uppercase text-gray-400 mb-2 block">Username</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-black transition">
                <FiUser className="text-gray-400 shrink-0" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  className="flex-1 text-sm outline-none bg-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-xs tracking-widest uppercase text-gray-400 mb-2 block">Phone Number</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-4 py-3 gap-3 focus-within:border-black transition">
                <FiPhone className="text-gray-400 shrink-0" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09XXXXXXXXX"
                  className="flex-1 text-sm outline-none bg-transparent"
                />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition font-semibold text-sm disabled:opacity-50"
            >
              {loading ? "Saving..." : saved ? "✓ Saved!" : <><FiSave /> Save Changes</>}
            </button>
          </form>

        </motion.div>
      </div>
      )}



    </div>
  );
}
