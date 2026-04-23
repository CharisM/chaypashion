"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiPackage, FiFacebook, FiChevronDown, FiChevronUp, FiShoppingBag, FiCheckCircle, FiClock, FiX, FiTruck, FiMapPin } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { getOrders, cancelOrder, submitRefundRequest, Order } from "@/lib/orders";
import { motion, AnimatePresence } from "framer-motion";

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; orderNumber: string } | null>(null);
  const [refundModal, setRefundModal] = useState<Order | null>(null);
  const [refundReason, setRefundReason] = useState("");
  const [submittingRefund, setSubmittingRefund] = useState(false);
  const [refundError, setRefundError] = useState("");
  const [refundSuccess, setRefundSuccess] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(5);
  const visibleOrders = orders.slice(0, visibleCount);

  const handleRefundSubmit = async () => {
    if (!refundModal || !userId) return;
    if (!refundReason.trim()) { setRefundError("Please provide a reason."); return; }
    setSubmittingRefund(true);
    setRefundError("");
    const { error } = await submitRefundRequest(
      refundModal.orderNumber, userId, username ?? "Customer",
      refundReason.trim(), refundModal.total, refundModal.paymentMethod ?? "cod"
    );
    setSubmittingRefund(false);
    if (error) { setRefundError(error); return; }
    setRefundSuccess("Refund request submitted! We'll review it within 1–2 business days.");
    setRefundReason("");
  };

  const handleCancel = async (orderNumber: string) => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setCancelling(orderNumber);
    try {
      const { error } = await cancelOrder(orderNumber);
      if (error) throw new Error(error);
      setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? { ...o, status: "cancelled" } : o));
      setNotification({ message: `Order #${orderNumber} has been cancelled.`, orderNumber });
    } catch (e) {
      alert("Failed to cancel order. Please try again.");
    }
    setCancelling(null);
  };

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTimeout(() => router.push("/login"), 0); return; }
      setUserId(user.id);
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      setUsername(profile?.username ?? user.email ?? null);
      const data = await getOrders(user.id);
      setOrders(data);
      setLoading(false);

      // real-time order status updates
      const channel = supabase
        .channel("orders-realtime")
        .on("postgres_changes", { event: "UPDATE", schema: "public", table: "orders", filter: `user_id=eq.${user.id}` },
          (payload: any) => {
            const updated = payload.new;
            setOrders(prev => prev.map(o =>
              o.orderNumber === updated.order_number
                ? { ...o, status: updated.status, delivered: updated.delivered, paymentStatus: updated.payment_status }
                : o
            ));
            const statusLabel: Record<string, string> = {
              processing: "is now being processed",
              shipped: "has been shipped! 🚚",
              delivered: "has been delivered! ✅",
              cancelled: "has been cancelled",
            };
            const label = statusLabel[updated.status];
            if (label) setNotification({ message: `Order #${updated.order_number} ${label}`, orderNumber: updated.order_number });
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    load();
  }, []);

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
          <>
          <div className="space-y-5">
            {visibleOrders.map((order, i) => (
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
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      order.status === "delivered" ? "bg-green-100" :
                      order.status === "shipped" ? "bg-purple-100" :
                      order.status === "cancelled" ? "bg-red-100" : "bg-yellow-50"
                    }`}>
                      {order.status === "delivered" ? <FiCheckCircle className="text-green-500 text-sm" /> :
                       order.status === "shipped" ? <FiTruck className="text-purple-500 text-sm" /> :
                       order.status === "cancelled" ? <FiX className="text-red-400 text-sm" /> :
                       <FiClock className="text-yellow-500 text-sm" />}
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-widest uppercase text-gray-700">Order #{order.orderNumber}</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Ordered on {order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                      order.status === "delivered" ? "bg-green-50 text-green-600 border-green-200" :
                      order.status === "shipped"   ? "bg-purple-50 text-purple-600 border-purple-200" :
                      order.status === "cancelled" ? "bg-red-50 text-red-500 border-red-200" :
                      order.status === "processing" ? "bg-blue-50 text-blue-600 border-blue-200" :
                      "bg-yellow-50 text-yellow-600 border-yellow-200"
                    }`}>
                      {order.status === "delivered" ? "Delivered" :
                       order.status === "shipped" ? "Shipped" :
                       order.status === "cancelled" ? "Cancelled" :
                       order.status === "processing" ? "Processing" : "Pending"}
                    </span>
                    {order.paymentMethod === "cod" && (
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                        order.status === "delivered"
                          ? "bg-green-50 text-green-600 border-green-200"
                          : "bg-gray-50 text-gray-500 border-gray-200"
                      }`}>
                        📦 {order.status === "delivered" ? "COD Paid" : "COD — Pay on Delivery"}
                      </span>
                    )}
                    {order.paymentMethod === "gcash" && (
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${
                        order.paymentStatus === "paid"
                          ? "bg-blue-50 text-blue-600 border-blue-200"
                          : "bg-orange-50 text-orange-500 border-orange-200"
                      }`}>
                        📱 GCash {order.paymentStatus === "paid" ? "✓ Verified" : "— Pending Verification"}
                      </span>
                    )}
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
                      {/* PROGRESS TRACKER */}
                      {order.status !== "cancelled" && (
                        <div className="bg-[#faf9f7] border border-[#e8e0d8] rounded-xl px-4 py-3">
                          <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-3">Order Progress</p>
                          <div className="flex items-center gap-0">
                            {(["pending", "processing", "shipped", "delivered"] as const).map((step, idx, arr) => {
                              const stepIndex = arr.indexOf(step);
                              const currentIndex = arr.indexOf(order.status as any) ?? 0;
                              const done = stepIndex <= currentIndex;
                              const active = stepIndex === currentIndex;
                              return (
                                <div key={step} className="flex items-center flex-1 last:flex-none">
                                  <div className="flex flex-col items-center">
                                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition ${
                                      done ? "bg-black text-white" : "bg-gray-200 text-gray-400"
                                    }`}>
                                      {done ? "✓" : idx + 1}
                                    </div>
                                    <p className={`text-[9px] mt-1 tracking-wide uppercase font-medium ${
                                      active ? "text-black" : done ? "text-gray-500" : "text-gray-300"
                                    }`}>{step}</p>
                                  </div>
                                  {idx < arr.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-1 mb-3 ${
                                      stepIndex < currentIndex ? "bg-black" : "bg-gray-200"
                                    }`} />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                      {order.status === "cancelled" && (
                        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 flex items-center gap-3">
                          <FiX className="text-red-400 shrink-0" />
                          <div>
                            <p className="text-[10px] tracking-widest uppercase text-gray-400">Order Status</p>
                            <p className="text-sm font-bold text-red-500 mt-0.5">This order has been cancelled</p>
                          </div>
                        </div>
                      )}

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

                  {/* ACTIONS ROW */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => setOpenOrder(openOrder === order.orderNumber ? null : order.orderNumber)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-black transition"
                    >
                      {openOrder === order.orderNumber ? <><FiChevronUp /> Hide Details</> : <><FiChevronDown /> View Details</>}
                    </button>
                    {order.status === "delivered" && (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-green-500 text-xs font-semibold">
                          <FiCheckCircle /> Order Delivered
                        </div>
                        <button
                          onClick={() => { setRefundModal(order); setRefundReason(""); setRefundError(""); setRefundSuccess(""); }}
                          className="text-xs text-gray-400 hover:text-black border border-gray-200 hover:border-black px-3 py-1.5 rounded-lg transition"
                        >
                          Request Refund / Return
                        </button>
                      </div>
                    )}
                    {order.status === "cancelled" && (
                      <div className="flex items-center gap-2 text-red-400 text-xs font-semibold">
                        <FiX /> Order Cancelled
                      </div>
                    )}
                    {(order.status === "pending" || order.status === "processing") && (
                      <button
                        onClick={() => handleCancel(order.orderNumber)}
                        disabled={cancelling === order.orderNumber}
                        className="flex items-center gap-1 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                      >
                        <FiX className="text-xs" />
                        {cancelling === order.orderNumber ? "Cancelling..." : "Cancel Order"}
                      </button>
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
          {visibleCount < orders.length && (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setVisibleCount(v => v + 5)}
                className="px-10 py-3 border-2 border-black text-sm font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition"
              >
                Load More ({orders.length - visibleCount} remaining)
              </button>
            </div>
          )}
          </>
        )}
      </div>

      {/* REFUND MODAL */}
      <AnimatePresence>
        {refundModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[9999] flex items-center justify-center p-6"
            onClick={() => !submittingRefund && setRefundModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-md w-full"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <p className="text-xs tracking-widest uppercase text-gray-400">Refund / Return Request</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">Order #{refundModal.orderNumber}</p>
                </div>
                <button onClick={() => setRefundModal(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                  <FiX className="text-gray-500 text-sm" />
                </button>
              </div>
              <div className="px-6 py-5">
                {refundSuccess ? (
                  <div className="text-center py-6">
                    <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                      <FiCheckCircle className="text-green-500 text-2xl" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mb-1">Request Submitted!</p>
                    <p className="text-xs text-gray-400">{refundSuccess}</p>
                    <button onClick={() => setRefundModal(null)} className="mt-4 bg-black text-white text-xs px-6 py-2.5 rounded-xl hover:bg-gray-800 transition font-semibold">
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
                      <div className="flex justify-between text-gray-500 mb-1">
                        <span>Total Paid</span>
                        <span className="font-bold text-gray-800">₱{refundModal.total.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-gray-500">
                        <span>Payment</span>
                        <span className="font-medium">{refundModal.paymentMethod === "gcash" ? "GCash" : "Cash on Delivery"}</span>
                      </div>
                    </div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">Reason for Refund / Return</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {["Wrong item received", "Damaged/defective item", "Item not as described", "Changed my mind"].map(r => (
                        <button
                          key={r}
                          onClick={() => setRefundReason(r)}
                          className={`text-xs px-3 py-1.5 rounded-full border transition ${
                            refundReason === r ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200 hover:border-black"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                    <textarea
                      value={refundReason}
                      onChange={e => setRefundReason(e.target.value)}
                      placeholder="Describe your issue in detail..."
                      rows={3}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black resize-none"
                    />
                    {refundError && <p className="text-red-500 text-xs mt-2">{refundError}</p>}
                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-3 text-xs text-blue-600">
                      📋 Refunds are processed manually within <strong>1–2 business days</strong>. {refundModal.paymentMethod === "gcash" ? "Amount will be returned via GCash." : "COD orders will be confirmed before processing."}
                    </div>
                    <button
                      onClick={handleRefundSubmit}
                      disabled={submittingRefund}
                      className="mt-4 w-full bg-black text-white text-sm font-bold py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
                    >
                      {submittingRefund ? "Submitting..." : "Submit Refund Request"}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STATUS NOTIFICATION TOAST */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            onAnimationComplete={() => {
              setTimeout(() => setNotification(null), 4000);
            }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-black text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] max-w-sm"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
              <FiPackage className="text-white text-sm" />
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold tracking-widest uppercase text-gray-400">Order Update</p>
              <p className="text-sm font-semibold mt-0.5">{notification.message}</p>
            </div>
            <button onClick={() => setNotification(null)} className="text-gray-400 hover:text-white transition shrink-0">
              <FiX className="text-sm" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
