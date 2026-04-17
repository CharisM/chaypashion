"use client";

import Link from "next/link";
import { FiFacebook } from "react-icons/fi";
import { motion } from "framer-motion";

const sections = [
  { title: "1. Acceptance of Terms", content: "By accessing and using the Chay Fashion website, you accept and agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our website or services." },
  { title: "2. Account Registration", prefix: "To access certain features such as viewing products and adding items to your cart, you must create an account. You agree to:", list: ["Provide accurate and complete registration information", "Keep your account credentials confidential", "Be responsible for all activity that occurs under your account", "Notify us immediately of any unauthorized use of your account"] },
  { title: "3. Products and Pricing", prefix: "Chay Fashion offers the following product categories:", list: ["Dresses — casual, everyday, and occasion wear", "Fossil Watches — authentic timepieces", "Herborist Scrubs — skincare and body care products"], suffix: "All prices are listed in Philippine Peso (₱). We reserve the right to change prices at any time without prior notice. Prices displayed at the time of your order will be honored." },
  { title: "4. Shopping Cart & Orders", content: "Adding an item to your cart does not guarantee its availability. Orders are only confirmed upon successful checkout and payment. We reserve the right to cancel orders due to stock unavailability or pricing errors." },
  { title: "5. Shipping", content: "A standard shipping fee of ₱150 applies to all orders. Delivery times may vary depending on your location within the Philippines. We are not responsible for delays caused by courier services or unforeseen circumstances." },
  { title: "6. Returns & Exchanges", content: "We accept returns and exchanges within 7 days of receiving your order, provided the item is unused, unwashed, and in its original condition with tags attached. Scrub products and watches must be returned in their original sealed packaging." },
  { title: "7. Prohibited Activities", prefix: "You agree not to:", list: ["Use the website for any unlawful purpose", "Create fake or multiple accounts", "Attempt to gain unauthorized access to any part of the website", "Post false, misleading, or harmful content"] },
  { title: "8. Limitation of Liability", content: "Chay Fashion shall not be liable for any indirect, incidental, or consequential damages arising from your use of our website or products. Our total liability shall not exceed the amount paid for the specific order in question." },
  { title: "9. Changes to Terms", content: "We reserve the right to update these Terms of Service at any time. Continued use of the website after changes are posted constitutes your acceptance of the revised terms." },
  { title: "10. Contact Us", content: "For questions regarding these Terms of Service, please reach out to us:", isContact: true },
];

export default function TermsOfService() {
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
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl font-bold mt-2">Terms of Service</motion.h1>
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
              {sec.prefix && <p className="mb-3">{sec.prefix}</p>}
              {sec.content && <p>{sec.content}</p>}
              {sec.list && (
                <ul className="list-disc pl-5 space-y-2">
                  {sec.list.map((item, j) => <li key={j}>{item}</li>)}
                </ul>
              )}
              {"suffix" in sec && sec.suffix && <p className="mt-3">{sec.suffix}</p>}
              {sec.isContact && (
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
          <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition text-xs">Privacy Policy</Link>
          <span className="text-gray-600">|</span>
          <Link href="/terms-of-service" className="text-white text-xs">Terms of Service</Link>
        </div>
      </footer>

    </div>
  );
}
