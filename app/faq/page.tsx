"use client";

import Link from "next/link";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiChevronDown, FiFacebook } from "react-icons/fi";

const faqs = [
  { q: "How do I place an order?", a: "Browse our collection, select your item, choose your size, and click 'Add to Cart'. Once you're ready, go to your cart and proceed to checkout." },
  { q: "What payment methods do you accept?", a: "We accept GCash, bank transfer, and cash on delivery (COD) for orders within the Philippines." },
  { q: "How long does shipping take?", a: "Standard shipping takes 3–5 business days within the Philippines. A flat shipping fee of ₱150 applies to all orders." },
  { q: "Can I return or exchange an item?", a: "Yes! We accept returns and exchanges within 7 days of receiving your order. Items must be unused, unwashed, and in original condition with tags attached." },
  { q: "How do I know my size?", a: "Check our Size Guide page for detailed measurements for dresses and scrubs. For Fossil watches, all are One Size. For Herborist scrubs, sizes refer to volume (50ml, 100ml, 200ml)." },
  { q: "Are the Fossil watches authentic?", a: "Yes, all Fossil watches sold at Chay Fashion are 100% authentic and come with original packaging." },
  { q: "How do I track my order?", a: "Once your order is shipped, you will receive a tracking number via email or Facebook message. You can use it to track your delivery." },
  { q: "Can I cancel my order?", a: "Orders can be cancelled within 24 hours of placing them. Please contact us via Facebook or email as soon as possible." },
  { q: "Do you ship outside the Philippines?", a: "Currently, we only ship within the Philippines. We hope to expand internationally in the future." },
  { q: "How do I contact customer support?", a: "You can reach us via email at support@chayfashion.com, or message us on Facebook at Chay Pasion." },
];

export default function FAQPage() {
  const [open, setOpen] = useState<number | null>(null);

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
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Help Center</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl font-bold mt-2">Frequently Asked Questions</motion.h1>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="w-16 h-px bg-[#c9a98a] mx-auto mt-5" />
        </div>
      </div>

      {/* FAQ LIST */}
      <div className="max-w-3xl mx-auto px-8 py-16 space-y-4">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="border border-gray-100 rounded-xl overflow-hidden"
          >
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex justify-between items-center px-6 py-5 text-left hover:bg-gray-50 transition"
            >
              <span className="font-semibold text-sm text-gray-800">{faq.q}</span>
              <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.3 }}>
                <FiChevronDown className="text-[#c9a98a] text-lg shrink-0" />
              </motion.div>
            </button>
            <AnimatePresence>
              {open === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">{faq.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 py-6 px-16 flex justify-between items-center">
        <p className="text-xs text-gray-600">© 2026 Chay Fashion. All rights reserved.</p>
        <div className="flex items-center gap-6">
          <a href="https://www.facebook.com/profile.php?id=61578244202994" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-blue-400 transition text-sm">
            <FiFacebook className="text-lg" /><span className="font-medium">Chay Pasion</span>
          </a>
          <span className="text-gray-600">|</span>
          <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition text-xs">Privacy Policy</Link>
          <span className="text-gray-600">|</span>
          <Link href="/terms-of-service" className="text-gray-300 hover:text-white transition text-xs">Terms of Service</Link>
        </div>
      </footer>

    </div>
  );
}
