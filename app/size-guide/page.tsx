"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FiFacebook } from "react-icons/fi";

export default function SizeGuidePage() {
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
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Fit Guide</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl font-bold mt-2">Size Guide</motion.h1>
          <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.6, delay: 0.3 }} className="w-16 h-px bg-[#c9a98a] mx-auto mt-5" />
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-8 py-16 space-y-16">

        {/* DRESS SIZE CHART */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold mb-2">Dress Sizes</h2>
          <p className="text-gray-500 text-sm mb-6">Measurements are in centimeters (cm). Choose the size closest to your measurements.</p>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm text-center">
              <thead className="bg-black text-white">
                <tr>
                  {["Size", "Bust (cm)", "Waist (cm)", "Hips (cm)", "Length (cm)"].map(h => (
                    <th key={h} className="px-6 py-4 font-semibold tracking-widest uppercase text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["XS", "76–80", "60–64", "84–88", "90–95"],
                  ["S",  "81–85", "65–69", "89–93", "90–95"],
                  ["M",  "86–90", "70–74", "94–98", "92–97"],
                  ["L",  "91–96", "75–80", "99–104","92–97"],
                  ["XL", "97–102","81–86", "105–110","94–99"],
                ].map(([size, ...vals], i) => (
                  <tr key={size} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 font-bold text-[#c9a98a]">{size}</td>
                    {vals.map((v, j) => <td key={j} className="px-6 py-4 text-gray-600">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* SCRUB SIZE CHART */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold mb-2">Herborist Scrub Sizes</h2>
          <p className="text-gray-500 text-sm mb-6">Scrub sizes refer to product volume. Choose based on your usage frequency.</p>
          <div className="overflow-x-auto rounded-xl border border-gray-100">
            <table className="w-full text-sm text-center">
              <thead className="bg-black text-white">
                <tr>
                  {["Size", "Volume", "Best For", "Approx. Uses"].map(h => (
                    <th key={h} className="px-6 py-4 font-semibold tracking-widest uppercase text-xs">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["50ml",  "50 milliliters",  "Travel / Trial",       "10–15 uses"],
                  ["100ml", "100 milliliters", "Regular Use",          "20–30 uses"],
                  ["200ml", "200 milliliters", "Daily / Family Use",   "40–60 uses"],
                ].map(([size, ...vals], i) => (
                  <tr key={size} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="px-6 py-4 font-bold text-[#c9a98a]">{size}</td>
                    {vals.map((v, j) => <td key={j} className="px-6 py-4 text-gray-600">{v}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* WATCH */}
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-bold mb-2">Fossil Watches</h2>
          <p className="text-gray-500 text-sm">All Fossil watches are <span className="font-semibold text-black">One Size</span> — they come with adjustable straps or bracelets to fit most wrist sizes comfortably.</p>
        </motion.div>

        {/* TIP */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} className="bg-[#faf9f7] border border-[#e8e0d8] rounded-2xl p-8">
          <h3 className="font-bold text-lg mb-2">How to Measure</h3>
          <ul className="text-sm text-gray-500 space-y-2 list-disc pl-5">
            <li><span className="font-semibold text-black">Bust:</span> Measure around the fullest part of your chest.</li>
            <li><span className="font-semibold text-black">Waist:</span> Measure around your natural waistline.</li>
            <li><span className="font-semibold text-black">Hips:</span> Measure around the fullest part of your hips.</li>
            <li>If you're between sizes, we recommend sizing up for comfort.</li>
          </ul>
        </motion.div>

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
