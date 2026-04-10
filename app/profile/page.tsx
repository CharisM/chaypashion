"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiUser, FiMail, FiPhone, FiLogOut } from "react-icons/fi";
import Link from "next/link";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ username: string; phone: string } | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      setEmail(user.email ?? "");
      const { data } = await supabase.from("profiles").select("username, phone").eq("id", user.id).single();
      setProfile(data);
    };
    getProfile();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
        <Link href="/" className="text-3xl font-serif italic">Chay Fashion</Link>
      </nav>

      <div className="flex justify-center mt-16 px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 w-full max-w-md">
          {/* AVATAR */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-black flex items-center justify-center mb-3">
              <FiUser className="text-white text-4xl" />
            </div>
            <h2 className="text-2xl font-bold">{profile?.username ?? "User"}</h2>
          </div>

          {/* INFO */}
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-3 border rounded-xl px-4 py-3">
              <FiUser className="text-gray-500" />
              <div>
                <p className="text-gray-400 text-xs">Username</p>
                <p className="font-medium">{profile?.username ?? "—"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border rounded-xl px-4 py-3">
              <FiMail className="text-gray-500" />
              <div>
                <p className="text-gray-400 text-xs">Email</p>
                <p className="font-medium">{email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 border rounded-xl px-4 py-3">
              <FiPhone className="text-gray-500" />
              <div>
                <p className="text-gray-400 text-xs">Phone</p>
                <p className="font-medium">{profile?.phone ?? "—"}</p>
              </div>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            onClick={handleLogout}
            className="mt-8 w-full flex items-center justify-center gap-2 bg-black text-white py-3 rounded-xl hover:bg-gray-900 transition font-semibold"
          >
            <FiLogOut /> Logout
          </button>
        </div>
      </div>
    </div>
  );
}
