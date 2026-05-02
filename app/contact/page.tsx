"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import { FiMapPin, FiPhone, FiMail, FiFacebook } from "react-icons/fi";
import Navbar from "@/components/Navbar";

import { saveContactMessage } from "@/lib/orders";

export default function Contact() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const prefill = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      setForm(f => ({ ...f, name: profile?.username ?? "", email: user.email ?? "" }));
    };
    prefill();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await saveContactMessage(form.name, form.email, form.message);
    setLoading(false);
    setSent(true);
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />

      {/* HERO */}
      <div className="relative w-full h-[70vh] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center animate-kenburns" style={{ backgroundImage: "url('/abct.jpg')" }} />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative h-full flex flex-col items-center justify-center text-center px-8">
          <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-xs tracking-[0.5em] text-[#c9a98a] uppercase font-medium mb-4">
            Get In Touch
          </motion.span>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1 }} className="text-white text-5xl font-bold tracking-tight">
            Contact Us
          </motion.h1>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.7, delay: 0.3 }} className="w-16 h-px bg-[#c9a98a] mt-6" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-5xl mx-auto px-8 py-20 grid grid-cols-2 gap-16 w-full">

        {/* INFO */}
        <motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Our Details</span>
          <h2 className="text-3xl font-bold mt-2 mb-8">We'd Love to Hear From You</h2>
          <div className="space-y-6">
            {[
              { icon: <FiMapPin className="text-[#c9a98a] text-xl shrink-0" />, label: "Location", value: "Philippines" },
              { icon: <FiPhone className="text-[#c9a98a] text-xl shrink-0" />, label: "Phone", value: "09123456789" },
              { icon: <FiMail className="text-[#c9a98a] text-xl shrink-0" />, label: "Email", value: "support@chayfashion.com" },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-4">
                {item.icon}
                <div>
                  <p className="text-xs tracking-widest uppercase text-gray-400 mb-0.5">{item.label}</p>
                  <p className="text-sm font-medium text-gray-800">{item.value}</p>
                </div>
              </div>
            ))}
            <div className="flex items-start gap-4">
              <FiFacebook className="text-[#c9a98a] text-xl shrink-0" />
              <div>
                <p className="text-xs tracking-widest uppercase text-gray-400 mb-0.5">Facebook</p>
                <a href="https://www.facebook.com/profile.php?id=61578244202994" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-blue-500 hover:underline">
                  Chay Pasion
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* FORM */}
        <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
          <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Send a Message</span>
          <h2 className="text-3xl font-bold mt-2 mb-8">Leave Us a Note</h2>
          {sent ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center">
              <p className="text-2xl mb-2">✓</p>
              <p className="font-semibold text-green-700">Message sent!</p>
              <p className="text-sm text-gray-500 mt-1">We'll get back to you soon.</p>
              <button onClick={() => setSent(false)} className="mt-4 text-xs text-gray-400 hover:text-black underline">Send another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-700 flex justify-between items-center">
                <span>{form.name}</span>
                <span className="text-[10px] text-gray-400 italic">from profile</span>
              </div>
              <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-700 flex justify-between items-center">
                <span>{form.email}</span>
                <span className="text-[10px] text-gray-400 italic">from profile</span>
              </div>
              <textarea
                required
                rows={5}
                placeholder="Your Message"
                value={form.message}
                onChange={e => setForm({ ...form, message: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black resize-none"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 text-xs font-bold tracking-[0.3em] uppercase hover:bg-gray-800 transition disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send Message"}
              </button>
            </form>
          )}
        </motion.div>
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
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
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
