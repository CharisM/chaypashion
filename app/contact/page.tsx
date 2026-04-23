"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FiUser, FiFacebook, FiMail, FiPhone, FiMapPin, FiSend, FiSearch, FiShoppingCart } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getCart } from "@/lib/cart";

export default function Contact() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState(false);
  const [sent, setSent] = useState(false);
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
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 4000);
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
                {username ? (
                  <>
                    <Link href="/profile" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                    <Link href="/orders" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">My Orders</Link>
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
      <div className="relative w-full h-[50vh] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center animate-kenburns" style={{ backgroundImage: "url('/abct.jpg')" }} />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xs tracking-[0.5em] text-[#c9a98a] uppercase font-medium mb-4"
          >
            Get In Touch
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-white text-5xl font-bold tracking-tight"
          >
            We'd Love to <span className="font-serif italic text-[#c9a98a]">Hear From You</span>
          </motion.h1>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-16 h-px bg-[#c9a98a] mt-6"
          />
        </div>
      </div>

      {/* CONTACT INFO CARDS */}
      <div className="bg-black py-14 px-8">
        <div className="max-w-5xl mx-auto grid grid-cols-3 gap-6">
          {[
            { icon: <FiMapPin className="text-2xl" />, label: "Location", value: "Philippines" },
            { icon: <FiMail className="text-2xl" />,   label: "Email",    value: "support@chayfashion.com" },
            { icon: <FiPhone className="text-2xl" />,  label: "Phone",    value: "09123456789" },
          ].map((info, i) => (
            <motion.div
              key={info.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-center gap-5 border border-white/10 px-6 py-5 hover:border-[#c9a98a] transition duration-300"
            >
              <div className="text-[#c9a98a] shrink-0">{info.icon}</div>
              <div>
                <p className="text-xs tracking-widest uppercase text-gray-500 mb-1">{info.label}</p>
                <p className="text-white text-sm font-medium">{info.value}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FORM SECTION */}
      <div className="bg-[#faf9f7] py-24 px-8 flex-1">
        <div className="max-w-5xl mx-auto grid grid-cols-2 gap-20 items-start">

          {/* LEFT TEXT */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Contact Form</span>
            <h2 className="text-4xl font-bold mt-3 mb-6 leading-tight">Send Us a <br />Message</h2>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">
              Have a question about an order, a product, or just want to say hello? Fill out the form and our team will get back to you as soon as possible.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                  <FiMail className="text-white text-xs" />
                </div>
                <p className="text-sm text-gray-500">support@chayfashion.com</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center shrink-0">
                  <FiFacebook className="text-white text-xs" />
                </div>
                <a
                  href="https://www.facebook.com/profile.php?id=61578244202994"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-[#c9a98a] hover:underline font-medium"
                >
                  Chay Pasion
                </a>
              </div>
            </div>
          </motion.div>

          {/* FORM */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs tracking-widest uppercase text-gray-400 mb-2 block">Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your name"
                    className="w-full bg-white border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#c9a98a] transition rounded-lg placeholder-gray-300"
                  />
                </div>
                <div>
                  <label className="text-xs tracking-widest uppercase text-gray-400 mb-2 block">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="Your email"
                    className="w-full bg-white border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#c9a98a] transition rounded-lg placeholder-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-gray-400 mb-2 block">Subject</label>
                <input
                  type="text"
                  placeholder="What is this about?"
                  className="w-full bg-white border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#c9a98a] transition rounded-lg placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-xs tracking-widest uppercase text-gray-400 mb-2 block">Message</label>
                <textarea
                  required
                  rows={5}
                  placeholder="Write your message here..."
                  className="w-full bg-white border border-gray-200 px-4 py-3 text-sm outline-none focus:border-[#c9a98a] transition rounded-lg placeholder-gray-300 resize-none"
                />
              </div>
              <button
                type="submit"
                className="ripple-btn w-full bg-black text-white py-4 text-xs font-bold tracking-[0.3em] uppercase hover:bg-gray-800 transition flex items-center justify-center gap-3 rounded-lg"
              >
                <FiSend /> Send Message
              </button>
              {sent && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-green-600 text-sm text-center"
                >
                  ✓ Message sent successfully!
                </motion.p>
              )}
            </form>
          </motion.div>

        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 pt-16 pb-8 px-16 mt-auto">
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
