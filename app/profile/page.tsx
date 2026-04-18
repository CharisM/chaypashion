"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiUser, FiMail, FiPhone, FiSearch, FiShoppingCart } from "react-icons/fi";
import Link from "next/link";
import { motion } from "framer-motion";
import { getCart } from "@/lib/cart";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<{ username: string; phone: string; email: string } | null>(null);
  const [search, setSearch] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTimeout(() => router.push("/login"), 0); return; }
      const { data } = await supabase.from("profiles").select("username, phone, email").eq("id", user.id).single();
      setProfile(data);
    };
    getProfile();
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsername(session?.user?.email ?? null);
      supabase.from("profiles").select("username").eq("id", session?.user?.id ?? "").single()
        .then(({ data }) => { if (data) setUsername(data.username); });
    });
    setCartCount(getCart().length);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
        <Link href="/" className="text-3xl font-serif italic">Chay Fashion</Link>
        <ul className="flex gap-8 text-sm font-medium items-center">
          <li>
            <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-full px-3 py-1.5 gap-2 hover:border-gray-500 transition">
              <FiSearch className="text-gray-400 text-sm shrink-0" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="text-xs outline-none bg-transparent w-36 placeholder-gray-400" />
            </form>
          </li>
          <li><Link href="/">HOME</Link></li>
          <li><Link href="/about">ABOUT</Link></li>
          <li>
            <Link href="/cart" className="relative flex items-center hover:opacity-70 transition">
              <FiShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </li>
          <li className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                <FiUser className="text-white text-lg" />
              </div>
              {username && <span className="text-sm font-medium">{username}</span>}
            </button>
            {dropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-[999] overflow-hidden">
                <Link href="/profile" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                <Link href="/orders" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">My Orders</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">Logout</button>
              </div>
            )}
          </li>
        </ul>
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
    </div>
  );
}
