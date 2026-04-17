"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FiSearch, FiUser, FiFacebook, FiShoppingCart } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getCart } from "@/lib/cart";

export default function About() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  useEffect(() => {
    const getUser = async (user: any) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        setUsername(data?.username ?? user.email ?? null);
      } else {
        setUsername(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) { supabase.auth.signOut(); return; }
      getUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") getUser(session?.user ?? null);
      else if (event === "SIGNED_OUT") setUsername(null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => { setCartCount(getCart().length); }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsername(null);
    setDropdown(false);
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
        <Link href="/"><h1 className="text-3xl font-serif italic">Chay Fashion</h1></Link>
        <ul className="flex gap-8 text-sm font-medium items-center">
          <li>
            <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-full px-3 py-1.5 gap-2 hover:border-gray-500 transition">
              <FiSearch className="text-gray-400 text-sm shrink-0" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="text-xs outline-none bg-transparent w-36 placeholder-gray-400" />
            </form>
          </li>
          <li><Link href="/">HOME</Link></li>
          <li className="text-blue-600">ABOUT</li>
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
                {username ? (
                  <>
                    <Link href="/profile" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                    <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">Logout</button>
                  </>
                ) : (
                  <Link href="/login" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Login</Link>
                )}
              </div>
            )}
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <div className="relative w-full h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center animate-kenburns" style={{ backgroundImage: "url('/abct.jpg')" }} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-[0.5em] text-[#c9a98a] uppercase font-medium mb-4"
          >
            Who We Are
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-white text-5xl font-bold tracking-tight leading-tight max-w-2xl"
          >
            Fashion That Tells <br />
            <span className="font-serif italic text-[#c9a98a]">Your Story</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-16 h-px bg-[#c9a98a] mt-6"
          />
        </div>
      </div>

      {/* INTRO */}
      <div className="bg-[#faf9f7] py-24 px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Our Story</span>
            <h2 className="text-4xl font-bold mt-3 mb-6 leading-tight">Born From a <br />Passion for Style</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              Chay Fashion was founded with a simple belief — that everyone deserves to look and feel their best without breaking the bank. We started as a small boutique and grew into a trusted fashion destination in the Philippines.
            </p>
            <p className="text-gray-500 leading-relaxed">
              From elegant dresses for every occasion, to authentic Fossil timepieces and premium Herborist skincare — every product we carry is handpicked with care, quality, and style in mind.
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative"
          >
            <img src="/D2.jpg" alt="About" className="w-full h-[420px] object-cover rounded-2xl shadow-lg" />
            <div className="absolute -bottom-6 -left-6 bg-black text-white p-6 rounded-2xl shadow-xl">
              <p className="text-3xl font-bold">3+</p>
              <p className="text-xs tracking-widest uppercase text-gray-400 mt-1">Years of Style</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* VALUES */}
      <div className="bg-white py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">What We Stand For</span>
            <h2 className="text-4xl font-bold mt-3">Our Core Values</h2>
          </div>
          <div className="grid grid-cols-3 gap-8">
            {[
              { icon: "✨", title: "Trendy", desc: "We stay ahead of the curve, bringing you the latest styles and fashion-forward pieces every season." },
              { icon: "💎", title: "Quality", desc: "Every item is carefully selected for premium quality — from fabric to finish, we never compromise." },
              { icon: "🤝", title: "Trust", desc: "We build lasting relationships with our customers through honest service, fair pricing, and genuine care." },
            ].map((val, i) => (
              <motion.div
                key={val.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group border border-gray-100 p-8 hover:border-[#c9a98a] hover:shadow-lg transition duration-300"
              >
                <div className="text-4xl mb-5">{val.icon}</div>
                <h3 className="font-bold text-lg mb-3 tracking-wide">{val.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="bg-[#faf9f7] py-24 px-8">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">What We Offer</span>
            <h2 className="text-4xl font-bold mt-3">Our Collections</h2>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {[
              { img: "/D1.jpg",     label: "Dresses",          desc: "Elegant, casual, and everything in between." },
              { img: "/WD1.jpg",    label: "Fossil Watches",   desc: "Authentic timepieces for every wrist." },
              { img: "/SCRUB1.jpg", label: "Herborist Scrubs", desc: "Premium skincare for a radiant glow." },
            ].map((cat, i) => (
              <motion.div
                key={cat.label}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative overflow-hidden rounded-2xl cursor-pointer"
              >
                <img src={cat.img} alt={cat.label} className="w-full h-64 object-cover group-hover:scale-105 transition duration-500" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition duration-300 rounded-2xl" />
                <div className="absolute bottom-0 left-0 p-6">
                  <h3 className="text-white font-bold text-lg">{cat.label}</h3>
                  <p className="text-gray-300 text-xs mt-1">{cat.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-black py-20 px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Ready to Shop?</span>
          <h2 className="text-4xl font-bold text-white mt-3 mb-6">Discover Your Style Today</h2>
          <p className="text-gray-400 text-sm max-w-md mx-auto mb-8">
            Browse our latest collections and find pieces that speak to you. Fashion is personal — let us help you express yours.
          </p>
          <Link href="/">
            <button className="border-2 border-white text-white px-10 py-3 text-sm tracking-[0.3em] uppercase hover:bg-white hover:text-black transition">
              Shop Now
            </button>
          </Link>
        </motion.div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 pt-16 pb-8 px-16 mt-auto border-t border-gray-800">
        <div className="grid grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          <div className="col-span-1">
            <h2 className="text-white text-2xl font-serif italic mb-4">Chay Fashion</h2>
            <p className="text-sm leading-relaxed text-gray-500">Modern styles for everyday wear. Quality fashion made accessible for everyone.</p>
          </div>
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Categories</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-white transition">Dress</Link></li>
              <li><Link href="/" className="hover:text-white transition">Watch</Link></li>
              <li><Link href="/" className="hover:text-white transition">Herborist Scrub</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Account</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/profile" className="hover:text-white transition">My Profile</Link></li>
              <li><Link href="/cart" className="hover:text-white transition">My Cart</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
            </ul>
          </div>
        </div>
        <div className="pt-6 flex justify-between items-center text-xs text-gray-600">
          <p>© 2026 Chay Fashion. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://www.facebook.com/profile.php?id=61578244202994" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-blue-400 transition">
              <FiFacebook className="text-lg" />
              <span className="text-sm font-medium">Chay Pasion</span>
            </a>
            <span className="text-gray-600">|</span>
            <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition">Privacy Policy</Link>
            <span className="text-gray-600">|</span>
            <Link href="/terms-of-service" className="text-gray-300 hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
