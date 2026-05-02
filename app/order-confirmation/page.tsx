"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiFacebook, FiMapPin, FiPackage, FiTruck, FiMail, FiShoppingBag, FiArrowRight } from "react-icons/fi";
import { getCart, CartItem } from "@/lib/cart";
import { saveOrder, clearCart, PaymentStatus } from "@/lib/orders";
import { deductStock } from "@/lib/stock";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

export default function OrderConfirmationPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [orderNumber, setOrderNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [deliveryAddress, setDeliveryAddress] = useState<{ fullName: string; phone: string; address: string; city: string; zip: string } | null>(null);
  const [orderError, setOrderError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const userId = user.id;

      // Prevent duplicate order on page refresh — load last order from DB instead
      if (sessionStorage.getItem("chay_order_placed")) {
        const { data } = await supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false }).limit(1).single();
        if (data) {
          setItems(data.items ?? []);
          setOrderNumber(data.order_number);
          setPaymentMethod(data.payment_method ?? "cod");
          const addr = data.customer_address ? { fullName: data.customer_name ?? "", phone: data.customer_phone ?? "", address: data.customer_address, city: "", zip: "" } : null;
          setDeliveryAddress(addr);
        }
        setLoading(false);
        return;
      }

      const cartItems = getCart(userId);
      if (cartItems.length === 0) { setLoading(false); return; }
      const payment = localStorage.getItem("chay_payment_method") ?? "cod";
      setPaymentMethod(payment);
      const savedAddress = localStorage.getItem("chay_delivery_address");
      const parsedAddress = savedAddress ? JSON.parse(savedAddress) : null;
      setDeliveryAddress(parsedAddress);
      const gcashProofUrl = localStorage.getItem("chay_gcash_proof_url") ?? undefined;
      const num = "CF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
      const subtotalAmt = cartItems.reduce((sum, item) => sum + item.price * (item.qty ?? 1), 0);
      const paymentStatus: PaymentStatus = payment === "gcash" ? "unpaid" : "paid";
      const order = {
        orderNumber: num,
        items: cartItems,
        subtotal: subtotalAmt,
        shipping: 150,
        total: subtotalAmt + 150,
        date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
        expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
        delivered: false,
        status: "pending" as const,
        paymentStatus,
        paymentMethod: payment,
        customerName: parsedAddress?.fullName,
        customerPhone: parsedAddress?.phone,
        customerAddress: parsedAddress ? `${parsedAddress.address}, ${parsedAddress.city}${parsedAddress.zip ? ` ${parsedAddress.zip}` : ""}` : undefined,
        gcashProofUrl,
      };
      const { error: saveError } = await saveOrder(order, userId);
      if (saveError) { console.error("saveOrder error:", saveError); setOrderError(`Failed to save your order: ${saveError}`); setLoading(false); return; }
      sessionStorage.setItem("chay_order_placed", "1");
      const stockResults = await Promise.all(cartItems.map(item => deductStock(item.id, item.qty ?? 1)));
      if (stockResults.some(r => r.error)) console.error("Some stock deductions failed");
      clearCart(userId);
      localStorage.removeItem("chay_payment_method");
      localStorage.removeItem("chay_delivery_address");
      localStorage.removeItem("chay_gcash_proof_url");
      const userEmail = user.email;
      if (userEmail) {
        try {
          await fetch("/api/send-order-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: userEmail, orderNumber: num, items: cartItems, subtotal: subtotalAmt, shipping: 150, total: subtotalAmt + 150, paymentMethod: payment, deliveryAddress: parsedAddress }),
          });
        } catch (e) { console.error("Email send failed:", e); }
      }
      setItems(cartItems);
      setOrderNumber(num);
      setLoading(false);
    };
    load();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + item.price * (item.qty ?? 1), 0);
  const shipping = items.length > 0 ? 150 : 0;
  const total = subtotal + shipping;

  if (loading) return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-2 border-black border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400 tracking-widest uppercase">Processing your order...</p>
      </div>
    </div>
  );

  if (orderError) return (
    <div className="min-h-screen bg-[#faf9f7] flex flex-col">
      <nav className="flex justify-between items-center px-12 py-5 bg-white border-b border-gray-100">
        <Link href="/" className="text-2xl font-serif italic tracking-wide">Chay Fashion</Link>
        <Link href="/" className="text-xs text-gray-400 hover:text-black transition tracking-widest uppercase">← Home</Link>
      </nav>
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-6">
            <span className="text-2xl">⚠️</span>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Something went wrong</h2>
          <p className="text-sm text-gray-400 mb-8">{orderError}</p>
          <Link href="/cart" className="inline-block bg-black text-white text-sm px-8 py-3 rounded-full hover:bg-gray-900 transition">Return to Cart</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-5 bg-white border-b border-gray-100">
        <Link href="/" className="text-2xl font-serif italic tracking-wide">Chay Fashion</Link>
        <Link href="/" className="text-xs text-gray-400 hover:text-black transition tracking-widest uppercase">← Home</Link>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-16 space-y-6">

        {/* HERO SUCCESS CARD */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="relative bg-black rounded-3xl overflow-hidden px-10 py-14 text-center"
        >
          {/* subtle background pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="w-20 h-20 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-6"
          >
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <motion.path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              />
            </svg>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <p className="text-white/50 text-xs tracking-[0.3em] uppercase mb-2">Order Confirmed</p>
            <h1 className="text-4xl font-serif italic text-white mb-3">Thank you!</h1>
            <p className="text-white/60 text-sm mb-8">Your order has been placed successfully.</p>

            <div className="inline-flex items-center gap-3 bg-white/10 border border-white/20 rounded-2xl px-6 py-3">
              <span className="text-white/50 text-xs tracking-widest uppercase">Order</span>
              <span className="text-white font-mono font-bold tracking-widest text-sm">#{orderNumber}</span>
            </div>

            <div className="mt-4">
              <span className={`inline-flex items-center gap-2 text-xs px-4 py-2 rounded-full font-medium ${
                paymentMethod === "gcash" ? "bg-blue-500/20 text-blue-300 border border-blue-500/30" : "bg-white/10 text-white/70 border border-white/20"
              }`}>
                {paymentMethod === "gcash" ? "📱 GCash Payment" : "📦 Cash on Delivery"}
              </span>
            </div>
          </motion.div>
        </motion.div>

        {/* TIMELINE */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="bg-white rounded-3xl px-8 py-7 border border-gray-100"
        >
          <p className="text-xs tracking-[0.2em] uppercase text-gray-400 font-medium mb-6">What happens next</p>
          <div className="flex items-start gap-0">
            {[
              { icon: FiPackage, label: "Order Placed", sub: "Just now", active: true },
              { icon: FiTruck, label: "Shipped", sub: "1–2 business days", active: false },
              { icon: FiMapPin, label: "Delivered", sub: "3–5 business days", active: false },
            ].map((step, i) => (
              <div key={i} className="flex-1 flex flex-col items-center relative">
                {i < 2 && <div className="absolute top-4 left-1/2 w-full h-px bg-gray-100" />}
                <div className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center mb-3 ${step.active ? "bg-black text-white" : "bg-gray-100 text-gray-400"}`}>
                  <step.icon className="text-sm" />
                </div>
                <p className={`text-xs font-semibold ${step.active ? "text-black" : "text-gray-400"}`}>{step.label}</p>
                <p className="text-[10px] text-gray-400 mt-0.5 text-center">{step.sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* DELIVERY ADDRESS */}
          {deliveryAddress && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white rounded-3xl px-7 py-6 border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-full bg-[#f5ede4] flex items-center justify-center">
                  <FiMapPin className="text-[#c9a98a] text-xs" />
                </div>
                <p className="text-xs tracking-[0.2em] uppercase text-gray-400 font-medium">Delivery Address</p>
              </div>
              <div className="space-y-1 text-sm text-gray-700">
                <p className="font-semibold text-black">{deliveryAddress.fullName}</p>
                <p className="text-gray-500">{deliveryAddress.phone}</p>
                <p className="text-gray-500">{deliveryAddress.address}</p>
                <p className="text-gray-500">{deliveryAddress.city}{deliveryAddress.zip ? `, ${deliveryAddress.zip}` : ""}</p>
              </div>
            </motion.div>
          )}

          {/* EMAIL NOTICE */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.5 }}
            className="bg-white rounded-3xl px-7 py-6 border border-gray-100 flex flex-col justify-center"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-[#f5ede4] flex items-center justify-center">
                <FiMail className="text-[#c9a98a] text-xs" />
              </div>
              <p className="text-xs tracking-[0.2em] uppercase text-gray-400 font-medium">Confirmation</p>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">A confirmation email has been sent to your registered email address with your order details.</p>
          </motion.div>
        </div>

        {/* ORDER SUMMARY */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="bg-white rounded-3xl overflow-hidden border border-gray-100"
        >
          <div className="px-7 py-5 border-b border-gray-100 flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#f5ede4] flex items-center justify-center">
              <FiShoppingBag className="text-[#c9a98a] text-xs" />
            </div>
            <p className="text-xs tracking-[0.2em] uppercase text-gray-400 font-medium">Order Summary</p>
            <span className="ml-auto text-xs text-gray-400">{items.length} item{items.length !== 1 ? "s" : ""}</span>
          </div>

          <div className="divide-y divide-gray-50">
            {items.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.05 }}
                className="flex items-center gap-4 px-7 py-4"
              >
                <div className="relative shrink-0">
                  <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded-2xl" />
                  {(item.qty ?? 1) > 1 && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-bold">{item.qty}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Size: {item.size}</p>
                </div>
                <p className="text-sm font-bold text-gray-800">₱{(item.price * (item.qty ?? 1)).toLocaleString()}</p>
              </motion.div>
            ))}
          </div>

          <div className="px-7 py-5 bg-gray-50/80 space-y-2.5">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Shipping</span><span>₱{shipping.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-black pt-2.5 border-t border-gray-200">
              <span>Total</span><span>₱{total.toLocaleString()}</span>
            </div>
          </div>
        </motion.div>

        {/* CTA BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex gap-3"
        >
          <Link href="/" className="flex-1 flex items-center justify-center gap-2 bg-black text-white py-4 rounded-2xl text-sm font-semibold hover:bg-gray-900 transition group">
            Continue Shopping
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link href="/orders" className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-700 py-4 rounded-2xl text-sm font-semibold hover:border-black hover:text-black transition">
            View My Orders
          </Link>
        </motion.div>

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
