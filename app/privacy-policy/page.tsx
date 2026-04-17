"use client";

import Link from "next/link";
import { FiFacebook } from "react-icons/fi";
import { motion } from "framer-motion";

const sections = [
  { title: "1. Introduction", content: "Welcome to Chay Fashion. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and make purchases from us." },
  { title: "2. Information We Collect", prefix: "We collect information that you provide directly to us when you:", list: ["Create an account (username, email address, phone number)", "Place an order or add items to your cart", "Contact us through our contact form", "Browse our products and categories"] },
  { title: "3. How We Use Your Information", prefix: "We use the information we collect to:", list: ["Process and fulfill your orders", "Manage your account and provide customer support", "Send you order confirmations and updates", "Improve our website, products, and services", "Communicate promotions and new arrivals (only with your consent)"] },
  { title: "4. Sharing Your Information", content: "We do not sell, trade, or rent your personal information to third parties. We may share your information only with trusted service providers who assist us in operating our website and conducting our business, provided they agree to keep your information confidential." },
  { title: "5. Data Security", content: "We implement appropriate security measures to protect your personal information. Your account is secured through Supabase authentication. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security." },
  { title: "6. Cookies", content: "Our website uses local storage to save your shopping cart items across sessions. We do not use tracking cookies for advertising purposes." },
  { title: "7. Your Rights", prefix: "You have the right to:", list: ["Access the personal information we hold about you", "Request correction of inaccurate information", "Request deletion of your account and personal data", "Opt out of marketing communications at any time"] },
  { title: "8. Contact Us", content: "If you have any questions about this Privacy Policy, please contact us at:", isContact: true },
];

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
        <Link href="/"><h1 className="text-3xl font-serif italic">Chay Fashion</h1></Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-black transition">← Back to Home</Link>
      </nav>

      {/* HERO */}
      <div className="bg-black text-white py-20 px-12 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/BG.jpg')] bg-cover bg-center animate-kenburns" />
        <div className="relative">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Legal</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl font-bold mt-2">Privacy Policy</motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-gray-400 text-sm mt-3">Last updated: January 1, 2026</motion.p>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="w-16 h-px bg-[#c9a98a] mx-auto mt-5" />
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-3xl mx-auto px-8 py-16 space-y-10 text-sm text-gray-600 leading-relaxed">
        {sections.map((sec, i) => (
          <motion.div
            key={sec.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.05 }}
          >
            <section>
              <h2 className="text-lg font-bold text-black mb-3 flex items-center gap-2">
                <span className="w-1 h-5 bg-[#c9a98a] inline-block rounded" />
                {sec.title}
              </h2>
              {"prefix" in sec && sec.prefix && <p className="mb-3">{sec.prefix}</p>}
              {"content" in sec && sec.content && <p>{sec.content}</p>}
              {"list" in sec && sec.list && (
                <ul className="list-disc pl-5 space-y-2">
                  {sec.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
              {"isContact" in sec && sec.isContact && (
                <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-5 space-y-2">
                  <p><span className="font-semibold text-black">Email:</span> support@chayfashion.com</p>
                  <p><span className="font-semibold text-black">Phone:</span> 09123456789</p>
                  <p><span className="font-semibold text-black">Facebook:</span> Chay Pasion</p>
                </div>
              )}
            </section>
            {i < sections.length - 1 && <div className="h-px bg-gray-100 mt-10" />}
          </motion.div>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 py-6 px-16 flex justify-between items-center">
        <p className="text-xs text-gray-600">© 2026 Chay Fashion. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="https://www.facebook.com/profile.php?id=61578244202994" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-blue-400 transition text-sm">
            <FiFacebook className="text-lg" />
            <span className="font-medium">Chay Pasion</span>
          </a>
          <span className="text-gray-600">|</span>
          <Link href="/privacy-policy" className="text-white text-xs">Privacy Policy</Link>
          <span className="text-gray-600">|</span>
          <Link href="/terms-of-service" className="text-gray-300 hover:text-white transition text-xs">Terms of Service</Link>
        </div>
      </footer>

    </div>
  );
}
