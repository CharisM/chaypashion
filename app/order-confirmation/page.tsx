"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiCheckCircle, FiFacebook, FiShoppingBag } from "react-icons/fi";
import { getCart, CartItem } from "@/lib/cart";
import { saveOrder, clearCart } from "@/lib/orders";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function OrderConfirmationPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const userId = user.id;
      const cartItems = getCart(userId);
      if (cartItems.length === 0) return;
      const payment = localStorage.getItem("chay_payment_method") ?? "cod";
      setPaymentMethod(payment);
      const num = "CF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const subtotalAmt = cartItems.reduce((sum, item) => sum + item.price, 0);
      const order = {
        orderNumber: num,
        items: cartItems,
        subtotal: subtotalAmt,
        shipping: 150,
        total: subtotalAmt + 150,
        date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
        delivered: false,
        paymentMethod: payment,
      };
      await saveOrder(order, userId);
      clearCart(userId);
      localStorage.removeItem("chay_payment_method");
      setItems(cartItems);
      setOrderNumber(num);
    };
    load();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const shipping = items.length > 0 ? 150 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
        <Link href="/" className="text-3xl font-serif italic">Chay Fashion</Link>
        <Link href="/" className="text-sm text-gray-500 hover:text-black transition">← Back to Home</Link>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* SUCCESS HEADER */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="text-center mb-12">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <FiCheckCircle className="text-green-500 text-4xl" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800">Order Confirmed!</h1>
          <p className="text-gray-500 text-sm mt-2">Thank you for shopping at Chay Fashion.</p>
          <div className="mt-3 inline-block bg-black text-white text-xs px-4 py-2 rounded-full tracking-widest uppercase">
            Order #{orderNumber}
          </div>
          <div className={`mt-3 inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full font-semibold ${
            paymentMethod === "gcash" ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
          }`}>
            {paymentMethod === "gcash" ? "📱 GCash Payment" : "📦 Cash on Delivery"}
          </div>
        </motion.div>

        {/* ORDER SUMMARY */}
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white rounded-2xl shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b flex items-center gap-2">
            <FiShoppingBag className="text-[#c9a98a]" />
            <p className="text-xs tracking-[0.2em] uppercase text-gray-400 font-medium">Order Summary</p>
          </div>
          <div className="divide-y">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-4 px-6 py-4">
                <img src={item.img} alt={item.name} className="w-14 h-14 object-cover rounded-lg shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">Size: {item.size}</p>
                </div>
                <p className="text-sm font-bold text-[#c9a98a]">₱{item.price.toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="px-6 py-4 border-t space-y-2 bg-gray-50">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span><span>₱{shipping.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t">
              <span>Total</span><span>₱{total.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* INFO */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white rounded-2xl shadow-sm p-6 mb-8 text-sm text-gray-500 space-y-2">
          <p>📦 Your order will be shipped within <span className="font-semibold text-black">1–2 business days</span>.</p>
          <p>🚚 Estimated delivery: <span className="font-semibold text-black">3–5 business days</span>.</p>
          <p>📩 A confirmation will be sent to your registered email.</p>
        </motion.div>

        <div className="flex gap-4">
          <Link href="/" className="flex-1 text-center bg-black text-white py-3 rounded-xl text-sm font-semibold hover:bg-gray-900 transition">
            Continue Shopping
          </Link>
          <Link href="/profile" className="flex-1 text-center border border-gray-200 text-gray-700 py-3 rounded-xl text-sm font-semibold hover:border-black transition">
            View Profile
          </Link>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 py-6 px-16 flex justify-between items-center mt-8">
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
