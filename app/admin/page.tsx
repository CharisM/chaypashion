"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiPackage, FiCheckCircle, FiChevronDown, FiChevronUp, FiClock, FiCalendar, FiShield } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { getOrders, markAsDelivered, Order, ADMIN_EMAIL } from "@/lib/orders";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || user.email !== ADMIN_EMAIL) {
        router.push("/");
        return;
      }
      setAuthorized(true);
      setOrders(getOrders());
    };
    check();
  }, []);

  const handleMarkDelivered = (orderNumber: string) => {
    markAsDelivered(orderNumber);
    setOrders(getOrders());
  };

  if (!authorized) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <p className="text-gray-400 text-sm">Checking authorization...</p>
    </div>
  );

  const pending = orders.filter(o => !o.delivered).length;
  const delivered = orders.filter(o => o.delivered).length;

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white border-b border-gray-100">
        <Link href="/" className="text-3xl font-serif italic">Chay Fashion</Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
          <FiShield className="text-black" /> Admin Panel
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-black text-white py-12 px-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/BG.jpg')] bg-cover bg-center animate-kenburns" />
        <div className="relative max-w-5xl mx-auto">
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Admin</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-4xl font-bold mt-2">Order Management</motion.h1>
          <div className="flex gap-8 mt-6">
            <div>
              <p className="text-2xl font-bold">{orders.length}</p>
              <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Total Orders</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-orange-400">{pending}</p>
              <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Pending</p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-2xl font-bold text-green-400">{delivered}</p>
              <p className="text-xs text-gray-400 tracking-widest uppercase mt-1">Delivered</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 space-y-5">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center">
            <FiPackage className="text-5xl text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400">No orders yet.</p>
          </div>
        ) : orders.map((order, i) => (
          <motion.div
            key={order.orderNumber}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
            className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
          >
            {/* TOP BAR */}
            <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${order.delivered ? "bg-green-100" : "bg-orange-50"}`}>
                  {order.delivered ? <FiCheckCircle className="text-green-500 text-sm" /> : <FiClock className="text-orange-400 text-sm" />}
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

            {/* BODY */}
            <div className="px-6 py-5">
              <div className="flex items-start gap-6">

                {/* IMAGES */}
                <div className="flex gap-2 shrink-0">
                  {order.items.slice(0, 4).map((item, j) => (
                    <div key={j} className="w-14 h-14 rounded-xl overflow-hidden border border-gray-100 shadow-sm">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  {order.items.length > 4 && (
                    <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
                      +{order.items.length - 4}
                    </div>
                  )}
                </div>

                <div className="h-14 w-px bg-gray-100 shrink-0" />

                {/* DELIVERY INFO */}
                <div className="flex-1">
                  <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-3 ${order.delivered ? "bg-green-50 border border-green-100" : "bg-[#faf9f7] border border-[#e8e0d8]"}`}>
                    <FiCalendar className={`text-lg shrink-0 ${order.delivered ? "text-green-500" : "text-[#c9a98a]"}`} />
                    <div>
                      <p className="text-[10px] tracking-widest uppercase text-gray-400">
                        {order.delivered ? "Delivered" : "Expected Delivery"}
                      </p>
                      <p className={`text-sm font-bold mt-0.5 ${order.delivered ? "text-green-600" : "text-gray-800"}`}>
                        {order.delivered ? "Order has been delivered" : (order.expectedDelivery ?? "Within 3 days")}
                      </p>
                    </div>
                  </div>

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
                      <p className="text-[10px] tracking-widest uppercase text-gray-400">Total</p>
                      <p className="text-sm font-bold text-gray-800 mt-0.5">₱{order.total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ADMIN ACTIONS */}
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                <button
                  onClick={() => setOpenOrder(openOrder === order.orderNumber ? null : order.orderNumber)}
                  className="flex items-center gap-1 text-xs text-gray-400 hover:text-black transition"
                >
                  {openOrder === order.orderNumber ? <><FiChevronUp /> Hide Details</> : <><FiChevronDown /> View Details</>}
                </button>

                {!order.delivered ? (
                  <button
                    onClick={() => handleMarkDelivered(order.orderNumber)}
                    className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-5 py-2 rounded-xl transition"
                  >
                    <FiCheckCircle /> Mark as Delivered
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-green-500 text-xs font-semibold">
                    <FiCheckCircle /> Delivered
                  </div>
                )}
              </div>
            </div>

            {/* EXPANDED */}
            <AnimatePresence>
              {openOrder === order.orderNumber && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden border-t border-gray-100"
                >
                  <div className="px-6 py-3 bg-gray-50">
                    <p className="text-[10px] tracking-[0.3em] uppercase text-gray-400 font-medium">Order Items</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {order.items.map((item, j) => (
                      <div key={j} className="flex items-center gap-5 px-6 py-4">
                        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 shadow-sm">
                          <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] uppercase tracking-widest text-gray-400">{item.category}</span>
                            <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">Size: {item.size}</span>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-[#c9a98a]">₱{item.price.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                  <div className="mx-6 my-4 bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₱{order.subtotal.toLocaleString()}</span></div>
                    <div className="flex justify-between text-gray-500"><span>Shipping</span><span>₱{order.shipping.toLocaleString()}</span></div>
                    <div className="flex justify-between font-bold text-gray-800 pt-2 border-t border-gray-200 text-base"><span>Total</span><span>₱{order.total.toLocaleString()}</span></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
