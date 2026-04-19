"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiPackage, FiFacebook, FiChevronDown, FiChevronUp, FiShoppingBag, FiCheckCircle, FiCalendar, FiClock } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { getOrders, markAsDelivered, Order } from "@/lib/orders";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTimeout(() => router.push("/login"), 0); return; }
      const data = await getOrders(user.id);
      setOrders(data);
      setLoading(false);
    };
    load();
  }, []);

  const handleMarkDelivered = async (orderNumber: string) => {
    await markAsDelivered(orderNumber);
    setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? { ...o, delivered: true } : o));
  };

  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white border-b border-gray-100">
        <Link href="/" className="text-3xl font-serif italic">Chay Fashion</Link>
        <Link href="/" className="text-sm text-gray-400 hover:text-black transition">← Back to Home</Link>
      </nav>

      {/* HERO STRIP */}
      <div className="bg-black text-white py-14 px-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/BG.jpg')] bg-cover bg-center animate-kenburns" />
        <div className="relative max-w-4xl mx-auto flex items-end justify-between">
          <div>
            <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Purchase History</motion.span>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-4xl font-bold mt-2">My Orders</motion.h1>
          </div>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }} className="text-right">
            <p className="text-3xl font-bold">{orders.length}</p>
            <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Total Orders</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : orders.length === 0 ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col items-center justify-center py-32 gap-6">
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
                <FiShoppingBag className="text-5xl text-gray-200" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-black rounded-full flex items-center justify-center">
                <FiPackage className="text-white text-sm" />
              </div>
            </div>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-800">No orders yet</h2>
              <p className="text-gray-400 text-sm mt-2 max-w-xs">Once you complete a purchase, your orders will appear here.</p>
            </div>
            <Link href="/shop" className="flex items-center gap-2 bg-black text-white px-8 py-3 text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition rounded-xl">
              Start Shopping
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-5">
            {orders.map((order, i) => (
              <motion.div
                key={order.orderNumber}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                className="border border-gray-100 rounded-2xl overflow-hidden hover:border-gray-300 transition duration-300 shadow-sm hover:shadow-md"
              >
                {/* TOP BAR */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.delivered ? "bg-green-100" : "bg-orange-50"}`}>
                      {order.delivered
                        ? <FiCheckCircle className="text-green-500 text-sm" />
                        : <FiClock className="text-orange-400 text-sm" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest uppercase text-gray-700">Order #{order.orderNumber}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Ordered on {order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                      order.delivered
                        ? "bg-green-50 text-green-600 border-green-200"
                        : "bg-orange-50 text-orange-500 border-orange-200"
                    }`}>
                      {order.delivered ? "Delivered" : "Processing"}
                    </span>
                    <span className="text-base font-bold text-gray-800">₱{order.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* CARD BODY */}
                <div className="px-6 py-5">
                  <div className="flex items-start gap-6">

                    {/* ITEM IMAGES */}
                    <div className="flex gap-2 shrink-0">
                      {order.items.slice(0, 4).map((item, j) => (
                        <div key={j} className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 shadow-sm shrink-0">
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                      ))}
                      {order.items.length > 4 && (
                        <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 border border-gray-100">
                          +{order.items.length - 4}
                        </div>
                      )}
                    </div>

                    {/* DIVIDER */}
                    <div className="h-16 w-px bg-gray-100 shrink-0" />

                    {/* DELIVERY INFO */}
                    <div className="flex-1 space-y-3">
                      {/* EXPECTED DELIVERY */}
                      <div className={`flex items-center gap-3 rounded-xl px-4 py-3 ${order.delivered ? "bg-green-50 border border-green-100" : "bg-[#faf9f7] border border-[#e8e0d8]"}`}>
                        <FiCalendar className={`text-lg shrink-0 ${order.delivered ? "text-green-500" : "text-[#c9a98a]"}`} />
                        <div>
                          <p className="text-[10px] tracking-widest uppercase text-gray-400">
                            {order.delivered ? "Delivered On" : "Expected Delivery"}
                          </p>
                          <p className={`text-sm font-bold mt-0.5 ${order.delivered ? "text-green-600" : "text-gray-800"}`}>
                            {order.delivered ? "Order has been delivered" : order.expectedDelivery ?? "Within 3 days"}
                          </p>
                        </div>
                      </div>

                      {/* QUICK STATS */}
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-gray-50 rounded-xl py-2">
                          <p className="text-[10px] tracking-widest uppercase text-gray-400">Items</p>
                          <p className="text-sm font-bold text-gray-800 mt-0.5">{order.items.length}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl py-2">
                          <p className="text-[10px] tracking-widest uppercase text-gray-400">Subtotal</p>
                          <p className="text-sm font-bold text-gray-800 mt-0.5">₱{order.subtotal.toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-xl py-2">
                          <p className="text-[10px] tracking-widest uppercase text-gray-400">Shipping</p>
                          <p className="text-sm font-bold text-gray-800 mt-0.5">₱{order.shipping.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ACTIONS ROW — no mark as delivered for customers */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => setOpenOrder(openOrder === order.orderNumber ? null : order.orderNumber)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-black transition"
                    >
                      {openOrder === order.orderNumber ? <><FiChevronUp /> Hide Details</> : <><FiChevronDown /> View Details</>}
                    </button>
                    {order.delivered && (
                      <div className="flex items-center gap-2 text-green-500 text-xs font-semibold">
                        <FiCheckCircle /> Order Delivered
                      </div>
                    )}
                  </div>
                </div>

                {/* EXPANDED ITEMS */}
                <AnimatePresence>
                  {openOrder === order.orderNumber && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-gray-100">
                        <div className="px-6 py-3 bg-gray-50">
                          <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 font-medium">Order Details</p>
                        </div>
                        <div className="divide-y divide-gray-50">
                          {order.items.map((item, j) => (
                            <motion.div
                              key={j}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: j * 0.05 }}
                              className="flex items-center gap-5 px-6 py-4 hover:bg-gray-50/50 transition"
                            >
                              <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                                <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                <div className="flex items-center gap-3 mt-1">
                                  <span className="text-[10px] tracking-widest uppercase text-gray-400">{item.category}</span>
                                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-medium">Size: {item.size}</span>
                                </div>
                              </div>
                              <p className="text-sm font-bold text-[#c9a98a] shrink-0">₱{item.price.toLocaleString()}</p>
                            </motion.div>
                          ))}
                        </div>
                        <div className="mx-6 my-4 bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                          <div className="flex justify-between text-gray-500">
                            <span>Subtotal</span><span>₱{order.subtotal.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between text-gray-500">
                            <span>Shipping</span><span>₱{order.shipping.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200 text-base">
                            <span>Total</span><span>₱{order.total.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
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
