"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FiSearch, FiUser } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Contact() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const getUser = async (user: any) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        setUsername(data?.username ?? user.email ?? null);
      } else {
        setUsername(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      getUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      getUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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
    router.push("/login");
  };
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow">
        <Link href="/"><h1 className="text-3xl font-serif italic">Chay Fashion</h1></Link>
        <ul className="flex gap-8 text-sm font-medium items-center">
          <li><Link href="/">HOME</Link></li>
          <li><Link href="/about">ABOUT</Link></li>
          <li className="text-blue-600">CONTACT US</li>
          <li><FiSearch className="text-lg cursor-pointer hover:opacity-70 transition" /></li>
          <li className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdown(!dropdown)}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                <FiUser className="text-white text-lg" />
              </div>
              {username && <span className="text-sm font-medium">{username}</span>}
            </button>
            {dropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-[999] overflow-hidden">
                <Link href="/profile" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                {username
                  ? <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">Logout</button>
                  : <Link href="/login" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Login</Link>
                }
              </div>
            )}
          </li>
        </ul>
      </nav>

      {/* HERO BANNER */}
      <div
        className="relative w-full h-72 flex items-center justify-center bg-cover bg-center"
        style={{ backgroundImage: "url('/abct.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative text-center">
          <span className="text-xs tracking-[0.4em] text-gray-300 uppercase">Get In Touch</span>
          <h1 className="text-white text-4xl font-bold mt-2 tracking-tight">Contact Us</h1>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-8 py-20 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* FORM */}
          <div className="md:col-span-2">
            <span className="text-xs tracking-[0.3em] text-gray-400 uppercase">Send a Message</span>
            <h2 className="text-2xl font-bold mt-2 mb-6">We'd love to hear from you.</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full border-b border-gray-300 py-3 outline-none text-sm focus:border-black transition bg-transparent placeholder-gray-400"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full border-b border-gray-300 py-3 outline-none text-sm focus:border-black transition bg-transparent placeholder-gray-400"
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full border-b border-gray-300 py-3 outline-none text-sm focus:border-black transition bg-transparent placeholder-gray-400 resize-none"
              />
              <button type="submit" className="mt-4 bg-black text-white px-10 py-3 text-xs tracking-widest uppercase hover:bg-gray-800 transition">
                Send Message
              </button>
            </form>
          </div>

          {/* CONTACT INFO */}
          <div className="space-y-8 pt-10">
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase font-semibold mb-2">Visit Us</h3>
              <p className="text-gray-500 text-sm">Philippines</p>
            </div>
            <div className="h-px bg-gray-100"></div>
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase font-semibold mb-2">Email</h3>
              <p className="text-gray-500 text-sm">support@chayfashion.com</p>
            </div>
            <div className="h-px bg-gray-100"></div>
            <div>
              <h3 className="text-xs tracking-[0.2em] uppercase font-semibold mb-2">Phone</h3>
              <p className="text-gray-500 text-sm">09123456789</p>
            </div>
          </div>

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
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/" className="hover:text-white transition">Shop</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">More</h3>
            <ul className="space-y-3 text-sm">
              <li><span className="hover:text-white transition cursor-pointer">Offers</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Gift Cards</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Terms</span></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Newsletter</h3>
            <p className="text-sm text-gray-500 mb-4">Get the latest drops and offers.</p>
            <div className="flex">
              <input type="email" placeholder="Your email" className="bg-gray-900 text-white text-sm px-4 py-2 outline-none flex-1 placeholder-gray-600 border border-gray-700 focus:border-gray-500 transition" />
              <button className="bg-white text-black px-4 py-2 text-sm font-semibold hover:bg-gray-200 transition">→</button>
            </div>
          </div>
        </div>
        <div className="pt-6 flex justify-between items-center text-xs text-gray-600">
          <p>© 2026 Chay Fashion. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}