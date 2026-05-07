"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiPackage, FiCheckCircle, FiChevronDown, FiChevronUp, FiClock, FiShield, FiTruck, FiX, FiBarChart2, FiMessageSquare, FiBox, FiList, FiLogOut, FiMenu, FiUsers, FiStar } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { getAllOrders, updateOrderStatus, updatePaymentStatus, getAllContactMessages, markMessageRead, saveMessageReply, Order, OrderStatus, PaymentStatus, ContactMessage, isAdmin, ADMIN_EMAILS } from "@/lib/orders";
import { getAllReviews, deleteReview, Review } from "@/lib/reviews";
import { getStockMap, setStock, StockMap, LOW_STOCK_THRESHOLD } from "@/lib/stock";
import { useProducts } from "@/lib/use-products";
import { motion, AnimatePresence } from "framer-motion";

const STATUS_FLOW: OrderStatus[] = ["pending", "processing", "shipped", "delivered", "cancelled"];

const STATUS_STYLE: Record<OrderStatus, string> = {
  pending:    "bg-yellow-50 text-yellow-600 border-yellow-200",
  processing: "bg-blue-50 text-blue-600 border-blue-200",
  shipped:    "bg-purple-50 text-purple-600 border-purple-200",
  delivered:  "bg-green-50 text-green-600 border-green-200",
  cancelled:  "bg-red-50 text-red-500 border-red-200",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending:    "Pending",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [openOrder, setOpenOrder] = useState<string | null>(null);
  const [authorized, setAuthorized] = useState(false);
  const [stockMap, setStockMapState] = useState<StockMap>({});
  const [editingStock, setEditingStock] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [savedStock, setSavedStock] = useState<Record<number, boolean>>({});
  const [activeSection, setActiveSection] = useState<"analytics" | "inventory" | "stock" | "customers" | "messages" | "orders" | "reviews">("orders");
  const [reportSort, setReportSort] = useState<"name" | "stock" | "value">("stock");
  const [customerSort, setCustomerSort] = useState<"name" | "orders" | "spent">("spent");
  const [customers, setCustomers] = useState<{ id: string; name: string; email: string; totalOrders: number; totalSpent: number; lastOrder: string }[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deletingReview, setDeletingReview] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [proofModal, setProofModal] = useState<{ url: string; orderNumber: string; paymentStatus: PaymentStatus } | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [visibleCount, setVisibleCount] = useState(10);
  const [newOrderToast, setNewOrderToast] = useState<Order | null>(null);
  const [arrivingToast, setArrivingToast] = useState(false);
  const { products, loading: productsLoading } = useProducts();

  useEffect(() => {
    const check = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const user = session?.user;

        if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
          router.replace("/admin/login");
          return;
        }
        
        setAuthorized(true);
        const data = await getAllOrders();
        setOrders(data);
      // Auto-open the latest order
      if (data.length > 0) setOpenOrder(data[0].orderNumber);

      // Build customers from orders + profiles
      const userIds = [...new Set(data.map(o => o.userId).filter(Boolean))] as string[];
      const { data: profiles } = await supabase.from("profiles").select("id, username, email").in("id", userIds);
      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      const customerMap = new Map<string, { id: string; name: string; email: string; totalOrders: number; totalSpent: number; lastOrder: string }>();
      data.forEach(o => {
        if (!o.userId) return;
        const p = profileMap.get(o.userId);
        const existing = customerMap.get(o.userId);
        if (existing) {
          existing.totalOrders += 1;
          if (o.status !== "cancelled") existing.totalSpent += o.total;
          if (o.date > existing.lastOrder) existing.lastOrder = o.date;
        } else {
          customerMap.set(o.userId, {
            id: o.userId,
            name: o.customerName ?? p?.username ?? "Unknown",
            email: p?.email ?? "—",
            totalOrders: 1,
            totalSpent: o.status !== "cancelled" ? o.total : 0,
            lastOrder: o.date,
          });
        }
      });
      setCustomers([...customerMap.values()]);

      const reviewData = await getAllReviews();
      setReviews(reviewData);
      const msgData = await getAllContactMessages();
      setMessages(msgData);
      const sm = await getStockMap();
      setStockMapState(sm);
      setEditingStock(sm);
      setLoading(false);
      // Show arriving today popup after load
      const todayStr = new Date().toDateString();
      const hasArriving = data.some(o =>
        o.expectedDelivery &&
        o.status !== "delivered" &&
        o.status !== "cancelled" &&
        (() => { try { return new Date(o.expectedDelivery!).toDateString() === todayStr; } catch { return false; } })()
      );
      if (hasArriving) setTimeout(() => setArrivingToast(true), 800);
      } catch (error) {
        console.error('Admin check error:', error);
        router.replace("/admin/login");
        return;
      }
    };
    check();

    // Real-time stock updates — reflects order placements & cancellations instantly
    const channel = supabase
      .channel("admin-stock-realtime")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "stock" },
        (payload: { new: { product_id: number; quantity: number } }) => {
          const { product_id, quantity } = payload.new;
          setStockMapState(prev => ({ ...prev, [product_id]: quantity }));
          setEditingStock(prev => ({ ...prev, [product_id]: quantity }));
        }
      )
      .subscribe();

    // Real-time new order notifications
    const ordersChannel = supabase
      .channel("admin-orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload: { new: any }) => {
          const o = payload.new;
          const newOrder: Order = {
            orderNumber: o.order_number,
            userId: o.user_id,
            items: o.items,
            subtotal: o.subtotal,
            shipping: o.shipping,
            total: o.total,
            date: o.date,
            expectedDelivery: o.expected_delivery,
            delivered: o.delivered,
            status: o.status ?? "pending",
            paymentStatus: o.payment_status ?? "unpaid",
            paymentMethod: o.payment_method,
            customerName: o.customer_name,
            customerPhone: o.customer_phone,
            customerAddress: o.customer_address,
            gcashProofUrl: o.gcash_proof_url,
          };
          setOrders(prev => [newOrder, ...prev]);
          setOpenOrder(newOrder.orderNumber);
          setActiveSection("orders");
          setNewOrderToast(newOrder);
          setTimeout(() => setNewOrderToast(null), 6000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(ordersChannel);
    };
  }, []);

  const handleStatusChange = async (orderNumber: string, status: OrderStatus) => {
    setUpdatingOrder(orderNumber);
    const order = orders.find(o => o.orderNumber === orderNumber);
    if (status === "cancelled" && order && order.status !== "cancelled") {
      await Promise.all(order.items.map(async (item) => {
        const { data } = await supabase.from("stock").select("quantity").eq("product_id", item.id).single();
        const current = data?.quantity ?? 0;
        await supabase.from("stock").update({ quantity: current + (item.qty ?? 1) }).eq("product_id", item.id);
      }));
    }
    const { error } = await updateOrderStatus(orderNumber, status);
    if (error) { alert(`Failed to update order status: ${error}`); setUpdatingOrder(null); return; }
    if (order?.userId && status !== "pending") {
      const { data: profile } = await supabase.from("profiles").select("email").eq("id", order.userId).maybeSingle();
      const email = profile?.email;
      if (email) {
        try {
          await fetch("/api/send-status-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, orderNumber, status, total: order.total, items: order.items, customerName: order.customerName, customerAddress: order.customerAddress, expectedDelivery: order.expectedDelivery, userId: order.userId }),
          });
        } catch (e) {
          console.error("Status email failed:", e);
        }
      }
    }
    setOrders(prev => prev.map(o => o.orderNumber === orderNumber
      ? { ...o, status, delivered: status === "delivered" }
      : o
    ));
    setUpdatingOrder(null);
  };

  const handlePaymentToggle = async (orderNumber: string, current: PaymentStatus) => {
    const next: PaymentStatus = current === "unpaid" ? "paid" : "unpaid";
    const { error } = await updatePaymentStatus(orderNumber, next);
    if (error) { alert(`Failed to update payment status: ${error}`); return; }
    setOrders(prev => prev.map(o => o.orderNumber === orderNumber ? { ...o, paymentStatus: next } : o));
  };

  const handleSaveStock = async (productId: number) => {
    const { error } = await setStock(productId, editingStock[productId] ?? 0);
    if (error) { alert(`Failed to save stock: ${error}`); return; }
    setStockMapState(prev => ({ ...prev, [productId]: editingStock[productId] ?? 0 }));
    setSavedStock(prev => ({ ...prev, [productId]: true }));
    setTimeout(() => setSavedStock(prev => ({ ...prev, [productId]: false })), 2000);
  };

  const handleDeleteReview = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    setDeletingReview(id);
    await deleteReview(id);
    setReviews(prev => prev.filter(r => r.id !== id));
    setDeletingReview(null);
  };

  const handleSaveAllStock = async () => {
    const results = await Promise.all(Object.entries(editingStock).map(([id, qty]) => setStock(Number(id), qty)));
    const failed = results.find(r => r.error);
    if (failed) { alert(`Failed to save stock: ${failed.error}`); return; }
    setStockMapState({ ...editingStock });
    const allSaved = Object.fromEntries(Object.keys(editingStock).map(id => [id, true]));
    setSavedStock(allSaved);
    setTimeout(() => setSavedStock({}), 2000);
  };

  const filtered = orders;
  const visibleFiltered = filtered.slice(0, visibleCount);

  const today = new Date().toDateString();
  const isArrivingToday = (order: Order) => {
    if (!order.expectedDelivery || order.status === "delivered" || order.status === "cancelled") return false;
    try { return new Date(order.expectedDelivery).toDateString() === today; } catch { return false; }
  };

  const arrivingTodayOrders = orders.filter(isArrivingToday);

  const counts = {
    total: orders.length,
    pending: orders.filter(o => o.status === "pending").length,
    processing: orders.filter(o => o.status === "processing").length,
    shipped: orders.filter(o => o.status === "shipped").length,
    delivered: orders.filter(o => o.status === "delivered").length,
    unpaid: orders.filter(o => o.paymentStatus === "unpaid" && o.paymentMethod === "gcash").length,
  };

  if (!authorized) return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const NAV_ITEMS = [
    { id: "analytics",  label: "Sales Analytics",  icon: <FiBarChart2 />,     iconColor: "text-violet-500", activeBg: "bg-violet-500" },
    { id: "inventory",  label: "Inventory Report", icon: <FiList />,          iconColor: "text-blue-500",   activeBg: "bg-blue-500" },
    { id: "stock",      label: "Stock Management", icon: <FiBox />,           iconColor: "text-emerald-500",activeBg: "bg-emerald-500" },
    { id: "customers",  label: "Customers",         icon: <FiUsers />,         iconColor: "text-amber-500",  activeBg: "bg-amber-500" },
    { id: "reviews",    label: "Reviews",           icon: <FiStar />,          iconColor: "text-yellow-500", activeBg: "bg-yellow-500" },
    { id: "messages",   label: "Messages",         icon: <FiMessageSquare />, iconColor: "text-sky-500",    activeBg: "bg-sky-500",    badge: messages.filter(m => !m.read).length },
    { id: "orders",     label: "Orders",           icon: <FiPackage />,       iconColor: "text-rose-500",   activeBg: "bg-rose-500" },
  ] as const;

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex">

      {/* SIDEBAR */}
      <aside className={`${sidebarOpen ? "w-64" : "w-[72px]"} bg-white border-r border-gray-100 shadow-sm flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto transition-all duration-300 z-20`}>

        {/* BRAND */}
        <div className="px-4 py-5 border-b border-gray-100">
          <div className={`flex items-center gap-3 ${!sidebarOpen && "justify-center"}`}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#c9a98a] to-[#a07850] flex items-center justify-center shrink-0 shadow-sm">
              <FiShield className="text-white text-base" />
            </div>
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 leading-tight truncate">Chay Fashion</p>
                <p className="text-[10px] text-[#c9a98a] font-semibold uppercase tracking-widest">Admin Panel</p>
              </div>
            )}
            {sidebarOpen && (
              <button onClick={() => setSidebarOpen(false)} className="text-gray-300 hover:text-gray-600 transition p-1 rounded-lg hover:bg-gray-100 shrink-0">
                <FiX className="text-sm" />
              </button>
            )}
          </div>
        </div>

        {/* NAV */}
        <nav className="flex-1 px-3 py-2 space-y-0.5">
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} className="w-full flex items-center justify-center py-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition mb-2">
              <FiMenu className="text-lg" />
            </button>
          )}
          {sidebarOpen && <p className="text-[9px] text-gray-400 uppercase tracking-[0.3em] font-semibold px-3 pt-1 pb-2">Navigation</p>}
          {NAV_ITEMS.map(item => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                title={!sidebarOpen ? item.label : undefined}
                className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive ? `${item.activeBg} text-white shadow-sm` : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                } ${!sidebarOpen ? "justify-center" : ""}`}
              >
                <span className={`text-base shrink-0 ${isActive ? "text-white" : item.iconColor}`}>{item.icon}</span>
                {sidebarOpen && <span className="flex-1 text-left text-[13px] font-medium">{item.label}</span>}
                {sidebarOpen && "badge" in item && item.badge > 0 && (
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isActive ? "bg-white/30 text-white" : "bg-red-500 text-white"}`}>{item.badge}</span>
                )}
                {!sidebarOpen && "badge" in item && item.badge > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
                )}
              </button>
            );
          })}
        </nav>

        {/* BOTTOM */}
        <div className="px-3 py-4 border-t border-gray-100 space-y-0.5">
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/admin/login"); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition ${!sidebarOpen ? "justify-center" : ""}`}
          >
            <FiLogOut className="text-base shrink-0" />
            {sidebarOpen && <span className="text-[13px] font-medium">Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {loading || productsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ANALYTICS DASHBOARD */}
            {activeSection === "analytics" && (() => {
                const delivered = orders.filter(o => o.status === "delivered");
                const totalRevenue = delivered.reduce((s, o) => s + o.total, 0);
                const totalOrders = orders.length;
                const cancelRate = totalOrders ? Math.round((orders.filter(o => o.status === "cancelled").length / totalOrders) * 100) : 0;
                const productSales: Record<number, { name: string; img: string; qty: number; revenue: number }> = {};
                delivered.forEach(o => o.items.forEach(item => {
                  if (!productSales[item.id]) productSales[item.id] = { name: item.name, img: item.img, qty: 0, revenue: 0 };
                  productSales[item.id].qty += item.qty ?? 1;
                  productSales[item.id].revenue += item.price * (item.qty ?? 1);
                }));
                const topProducts = Object.entries(productSales).sort((a, b) => b[1].qty - a[1].qty).slice(0, 5);
                const categorySales: Record<string, number> = {};
                delivered.forEach(o => o.items.forEach(item => {
                  categorySales[item.category] = (categorySales[item.category] ?? 0) + item.price * (item.qty ?? 1);
                }));
                const totalCatRevenue = Object.values(categorySales).reduce((s, v) => s + v, 0);
                const gcashOrders = orders.filter(o => o.paymentMethod === "gcash").length;
                const codOrders = orders.filter(o => o.paymentMethod === "cod").length;
                return (
                  <div className="space-y-4">
                    {/* DASHBOARD LABEL */}
                    <p className="text-[10px] text-[#c9a98a] uppercase tracking-[0.3em] font-semibold">Dashboard</p>

                    {/* QUICK STATS */}
                    <div className="bg-gradient-to-br from-[#1a1a2e] to-[#16213e] rounded-2xl p-5">
                      <p className="text-[9px] text-white/40 uppercase tracking-[0.3em] font-semibold mb-3">Quick Stats</p>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: "Orders",    value: counts.total,     color: "text-white" },
                          { label: "Pending",   value: counts.pending,   color: "text-yellow-400" },
                          { label: "Shipped",   value: counts.shipped,   color: "text-purple-400" },
                          { label: "Delivered", value: counts.delivered, color: "text-emerald-400" },
                        ].map((s, i) => (
                          <div key={i} className="bg-white/5 rounded-xl px-3 py-3 text-center">
                            <p className={`text-2xl font-bold leading-none ${s.color}`}>{s.value}</p>
                            <p className="text-[9px] text-white/30 uppercase tracking-widest mt-1.5">{s.label}</p>
                          </div>
                        ))}
                      </div>
                      {counts.unpaid > 0 && (
                        <div className="mt-3 bg-red-500/20 border border-red-500/30 rounded-xl px-4 py-2 flex items-center justify-between">
                          <span className="text-[10px] text-red-300 font-medium">GCash Unpaid</span>
                          <span className="text-xs font-bold text-red-400">{counts.unpaid}</span>
                        </div>
                      )}
                    </div>

                    {/* HEADER */}
                    <div className="bg-[#0a0a0a] rounded-2xl px-6 py-5 flex items-center justify-between">
                      <h2 className="text-xl font-bold text-white">Sales Analytics</h2>
                      <FiBarChart2 className="text-[#c9a98a] text-2xl" />
                    </div>

                    {/* KPI CARDS */}
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, sub: "from delivered orders", accent: "border-[#c9a98a]/40", valueColor: "text-[#c9a98a]" },
                        { label: "Total Orders", value: totalOrders, sub: `${delivered.length} delivered`, accent: "border-white/10", valueColor: "text-white" },
                        { label: "Cancellation Rate", value: `${cancelRate}%`, sub: `${orders.filter(o => o.status === "cancelled").length} cancelled`, accent: cancelRate > 20 ? "border-red-500/40" : "border-emerald-500/40", valueColor: cancelRate > 20 ? "text-red-400" : "text-emerald-400" },
                      ].map((k, i) => (
                        <div key={i} className={`bg-[#111111] rounded-2xl p-5 border ${k.accent}`}>
                          <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-2">{k.label}</p>
                          <p className={`text-3xl font-bold ${k.valueColor}`}>{k.value}</p>
                          <p className="text-[11px] text-white/20 mt-1.5">{k.sub}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {/* TOP PRODUCTS */}
                      <div className="bg-[#111111] rounded-2xl p-5 border border-white/5">
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] font-semibold mb-4">Top Selling Products</p>
                        {topProducts.length === 0 ? (
                          <p className="text-xs text-white/20 italic">No sales data yet.</p>
                        ) : (
                          <div className="space-y-3">
                            {topProducts.map(([id, p], i) => (
                              <div key={id} className="flex items-center gap-3">
                                <span className="text-xs font-bold text-white/20 w-4">{i + 1}</span>
                                <img src={p.img} alt={p.name} className="w-9 h-9 object-cover rounded-lg shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-semibold text-white/80 truncate">{p.name}</p>
                                  <p className="text-[10px] text-white/30">{p.qty} sold · ₱{p.revenue.toLocaleString()}</p>
                                </div>
                                <div className="w-16 h-1 bg-white/10 rounded-full overflow-hidden">
                                  <div className="h-full bg-[#c9a98a] rounded-full" style={{ width: `${Math.round((p.qty / topProducts[0][1].qty) * 100)}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* RIGHT COLUMN */}
                      <div className="space-y-4">
                        {/* REVENUE BY CATEGORY */}
                        <div className="bg-[#111111] rounded-2xl p-5 border border-white/5">
                          <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] font-semibold mb-4">Revenue by Category</p>
                          {Object.keys(categorySales).length === 0 ? (
                            <p className="text-xs text-white/20 italic">No sales data yet.</p>
                          ) : (
                            <div className="space-y-2.5">
                              {Object.entries(categorySales).sort((a, b) => b[1] - a[1]).map(([cat, rev]) => (
                                <div key={cat}>
                                  <div className="flex justify-between text-xs mb-1">
                                    <span className="text-white/60 font-medium">{cat}</span>
                                    <span className="text-white/30">{totalCatRevenue ? Math.round((rev / totalCatRevenue) * 100) : 0}%</span>
                                  </div>
                                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-[#c9a98a] to-[#e8c9a0] rounded-full" style={{ width: `${totalCatRevenue ? Math.round((rev / totalCatRevenue) * 100) : 0}%` }} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* PAYMENT METHODS */}
                        <div className="bg-[#111111] rounded-2xl p-5 border border-white/5">
                          <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] font-semibold mb-4">Payment Methods</p>
                          <div className="flex gap-3">
                            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center border border-white/5">
                              <p className="text-2xl font-bold text-white">{gcashOrders}</p>
                              <p className="text-[10px] text-[#c9a98a] uppercase tracking-widest mt-1">GCash</p>
                            </div>
                            <div className="flex-1 bg-white/5 rounded-xl p-3 text-center border border-white/5">
                              <p className="text-2xl font-bold text-white">{codOrders}</p>
                              <p className="text-[10px] text-white/30 uppercase tracking-widest mt-1">COD</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}


            {/* INVENTORY REPORT */}
            {activeSection === "inventory" && (() => {
              const totalValue = products.reduce((sum, p) => sum + (stockMap[p.id] ?? 0) * p.price, 0);
              const inStock = products.filter(p => (stockMap[p.id] ?? 0) > LOW_STOCK_THRESHOLD).length;
              const lowStock = products.filter(p => (stockMap[p.id] ?? 0) > 0 && (stockMap[p.id] ?? 0) <= LOW_STOCK_THRESHOLD).length;
              const outOfStock = products.filter(p => (stockMap[p.id] ?? 0) === 0).length;
              const healthPct = products.length ? Math.round((inStock / products.length) * 100) : 0;
              return (
                <div className="space-y-4">
                  {/* HEADER */}
                  <div className="bg-[#0a0a0a] rounded-2xl px-6 py-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-blue-400 uppercase tracking-[0.3em] font-semibold">Inventory</p>
                      <h2 className="text-xl font-bold text-white mt-0.5">Inventory Report</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Stock Health</p>
                        <p className="text-lg font-bold text-emerald-400">{healthPct}%</p>
                      </div>
                      <FiList className="text-blue-400 text-2xl" />
                    </div>
                  </div>

                  {/* KPI CARDS */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Total Products", value: products.length, sub: "in catalog", color: "text-white", accent: "border-white/10", icon: "📦" },
                      { label: "In Stock", value: inStock, sub: "healthy level", color: "text-emerald-400", accent: "border-emerald-500/30", icon: "✅" },
                      { label: "Low Stock", value: lowStock, sub: "needs restock", color: "text-orange-400", accent: "border-orange-500/30", icon: "⚠️" },
                      { label: "Out of Stock", value: outOfStock, sub: "unavailable", color: "text-red-400", accent: "border-red-500/30", icon: "❌" },
                    ].map((s, i) => (
                      <div key={i} className={`bg-[#111111] rounded-2xl p-5 border ${s.accent}`}>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] tracking-[0.25em] uppercase text-white/30">{s.label}</p>
                          <span className="text-base">{s.icon}</span>
                        </div>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[11px] text-white/20 mt-1">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* TOTAL VALUE BANNER */}
                  <div className="bg-gradient-to-r from-[#1a1a2e] to-[#16213e] rounded-2xl px-6 py-4 flex items-center justify-between border border-white/5">
                    <div>
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.3em] font-semibold">Total Inventory Value</p>
                      <p className="text-2xl font-bold text-[#c9a98a] mt-0.5">₱{totalValue.toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-6 text-center">
                      <div>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest">Avg. Price</p>
                        <p className="text-sm font-bold text-white/60 mt-0.5">
                          ₱{products.length ? Math.round(products.reduce((s, p) => s + p.price, 0) / products.length).toLocaleString() : 0}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/20 uppercase tracking-widest">Total Units</p>
                        <p className="text-sm font-bold text-white/60 mt-0.5">
                          {Object.values(stockMap).reduce((s, v) => s + v, 0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* TABLE */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* TABLE HEADER */}
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-[0.2em]">Product List</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-gray-400">Sort by:</p>
                        {(["name", "stock", "value"] as const).map(s => (
                          <button
                            key={s}
                            onClick={() => setReportSort(s)}
                            className={`text-[11px] px-3 py-1 rounded-lg border font-semibold transition ${
                              reportSort === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                            }`}
                          >
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-6 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Product</th>
                          <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Category</th>
                          <th className="text-center px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Stock</th>
                          <th className="text-center px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Unit Price</th>
                          <th className="text-center px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Stock Bar</th>
                          <th className="text-right px-6 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Value</th>
                          <th className="text-center px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {[...products]
                          .sort((a, b) => {
                            if (reportSort === "name") return a.name.localeCompare(b.name);
                            if (reportSort === "stock") return (stockMap[a.id] ?? 0) - (stockMap[b.id] ?? 0);
                            return ((stockMap[b.id] ?? 0) * b.price) - ((stockMap[a.id] ?? 0) * a.price);
                          })
                          .map(p => {
                            const qty = stockMap[p.id] ?? 0;
                            const value = qty * p.price;
                            const maxQty = Math.max(...Object.values(stockMap), 1);
                            const barPct = Math.round((qty / maxQty) * 100);
                            const isOut = qty === 0;
                            const isLow = !isOut && qty <= LOW_STOCK_THRESHOLD;
                            return (
                              <tr key={p.id} className={`hover:bg-gray-50/60 transition ${isOut ? "bg-red-50/30" : isLow ? "bg-orange-50/30" : ""}` }>
                                <td className="px-6 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <img src={p.img} alt={p.name} className="w-10 h-10 object-cover rounded-xl shrink-0 border border-gray-100" />
                                    <div>
                                      <p className="font-semibold text-gray-800 text-sm truncate max-w-[150px]">{p.name}</p>
                                      <p className="text-[10px] text-gray-400">ID #{p.id}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5">
                                  <span className="text-[11px] bg-gray-100 text-gray-500 px-2.5 py-1 rounded-lg font-medium">{p.category}</span>
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className={`text-sm font-bold ${isOut ? "text-red-500" : isLow ? "text-orange-500" : "text-gray-800"}`}>{qty}</span>
                                </td>
                                <td className="px-4 py-3.5 text-center text-sm text-gray-500 font-medium">₱{p.price.toLocaleString()}</td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div
                                        className={`h-full rounded-full transition-all ${
                                          isOut ? "bg-red-400" : isLow ? "bg-orange-400" : "bg-emerald-400"
                                        }`}
                                        style={{ width: `${barPct}%` }}
                                      />
                                    </div>
                                    <span className="text-[10px] text-gray-300 w-6 text-right">{barPct}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3.5 text-right font-bold text-[#c9a98a] text-sm">₱{value.toLocaleString()}</td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold ${
                                    isOut ? "bg-red-100 text-red-600" :
                                    isLow ? "bg-orange-100 text-orange-600" :
                                    "bg-emerald-100 text-emerald-700"
                                  }`}>
                                    {isOut ? "Out of Stock" : isLow ? "Low Stock" : "In Stock"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50 border-t-2 border-gray-200">
                          <td colSpan={5} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total Inventory Value</td>
                          <td className="px-6 py-4 text-right text-base font-bold text-gray-900">₱{totalValue.toLocaleString()}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              );
            })()}

            {/* STOCK MANAGEMENT */}
            {activeSection === "stock" && (() => {
              // Build sold map from non-cancelled orders
              const soldMap: Record<number, number> = {};
              orders.filter(o => o.status !== "cancelled").forEach(o =>
                o.items.forEach(item => { soldMap[item.id] = (soldMap[item.id] ?? 0) + (item.qty ?? 1); })
              );
              const outCount = products.filter(p => (stockMap[p.id] ?? 0) === 0).length;
              const lowCount = products.filter(p => (stockMap[p.id] ?? 0) > 0 && (stockMap[p.id] ?? 0) <= LOW_STOCK_THRESHOLD).length;
              const totalUnits = Object.values(stockMap).reduce((s, v) => s + v, 0);
              const totalSold = Object.values(soldMap).reduce((s, v) => s + v, 0);
              return (
                <div className="space-y-4">
                  {/* HEADER */}
                  <div className="bg-[#0a0a0a] rounded-2xl px-6 py-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-emerald-400 uppercase tracking-[0.3em] font-semibold">Inventory</p>
                      <h2 className="text-xl font-bold text-white mt-0.5">Stock Management</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSaveAllStock}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs px-5 py-2.5 rounded-xl font-bold tracking-wide transition"
                      >
                        Save All Changes
                      </button>
                      <FiBox className="text-emerald-400 text-2xl" />
                    </div>
                  </div>

                  {/* KPI CARDS */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      { label: "Total Units", value: totalUnits, sub: "remaining in stock", color: "text-white", accent: "border-white/10", icon: "📦" },
                      { label: "Total Sold", value: totalSold, sub: "from active orders", color: "text-[#c9a98a]", accent: "border-[#c9a98a]/30", icon: "🛒" },
                      { label: "Low Stock", value: lowCount, sub: "needs attention", color: "text-orange-400", accent: "border-orange-500/30", icon: "⚠️" },
                      { label: "Out of Stock", value: outCount, sub: "unavailable", color: "text-red-400", accent: "border-red-500/30", icon: "❌" },
                    ].map((s, i) => (
                      <div key={i} className={`bg-[#111111] rounded-2xl p-5 border ${s.accent}`}>
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[10px] tracking-[0.25em] uppercase text-white/30">{s.label}</p>
                          <span className="text-base">{s.icon}</span>
                        </div>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[11px] text-white/20 mt-1">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* PRODUCT LIST */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                      <div>
                        <p className="text-xs font-bold text-gray-700 uppercase tracking-[0.2em]">Stock vs Orders</p>
                        <p className="text-[11px] text-gray-400 mt-0.5">{products.length} products · {outCount} out of stock · {totalSold} units sold</p>
                      </div>
                      <button
                        onClick={handleSaveAllStock}
                        className="bg-gray-900 hover:bg-black text-white text-xs px-4 py-2 rounded-lg font-semibold transition"
                      >
                        Save All
                      </button>
                    </div>

                    <div className="divide-y divide-gray-50">
                      {products.map((p) => {
                        const current = stockMap[p.id] ?? 0;
                        const editing = editingStock[p.id] ?? 0;
                        const sold = soldMap[p.id] ?? 0;
                        const isDirty = editing !== current;
                        const isSaved = savedStock[p.id];
                        const isOut = current === 0;
                        const isLow = !isOut && current <= LOW_STOCK_THRESHOLD;
                        const maxQty = Math.max(...Object.values(stockMap), 1);
                        const barPct = Math.round((current / maxQty) * 100);
                        return (
                          <div key={p.id} className={`flex items-center gap-4 px-6 py-4 transition ${
                            isOut ? "bg-red-50/40" : isLow ? "bg-orange-50/30" : ""
                          }`}>
                            {/* PRODUCT INFO */}
                            <img src={p.img} alt={p.name} className="w-12 h-12 object-cover rounded-xl shrink-0 border border-gray-100" />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-gray-800 truncate">{p.name}</p>
                                {isDirty && <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide shrink-0">Unsaved</span>}
                              </div>
                              <div className="flex items-center gap-3 mt-1.5">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">{p.category}</span>
                                <div className="flex items-center gap-1.5 flex-1 max-w-[120px]">
                                  <div className="flex-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full ${ isOut ? "bg-red-400" : isLow ? "bg-orange-400" : "bg-emerald-400" }`} style={{ width: `${barPct}%` }} />
                                  </div>
                                  <span className="text-[9px] text-gray-300">{barPct}%</span>
                                </div>
                              </div>
                            </div>

                            {/* SOLD FROM ORDERS */}
                            <div className="text-center shrink-0 w-20">
                              <p className="text-[9px] text-gray-400 uppercase tracking-widest mb-0.5">Sold</p>
                              <p className={`text-sm font-bold ${sold > 0 ? "text-[#c9a98a]" : "text-gray-300"}`}>{sold}</p>
                            </div>

                            {/* STATUS BADGE */}
                            <span className={`text-[10px] px-2.5 py-1 rounded-lg font-bold shrink-0 ${
                              isOut ? "bg-red-100 text-red-600" :
                              isLow ? "bg-orange-100 text-orange-600" :
                              "bg-emerald-100 text-emerald-700"
                            }`}>
                              {isOut ? "Out of Stock" : isLow ? `⚠ ${current} left` : `${current} in stock`}
                            </span>

                            {/* STEPPER */}
                            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden shrink-0">
                              <button onClick={() => setEditingStock(prev => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] ?? 0) - 1) }))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition font-bold text-base">−</button>
                              <input
                                type="number" min={0}
                                value={editingStock[p.id] ?? 0}
                                onChange={(e) => setEditingStock(prev => ({ ...prev, [p.id]: Math.max(0, Number(e.target.value)) }))}
                                className="w-14 text-sm text-center outline-none py-1.5 border-x border-gray-200 font-semibold text-gray-800"
                              />
                              <button onClick={() => setEditingStock(prev => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 }))} className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition font-bold text-base">+</button>
                            </div>

                            {/* SAVE BUTTON */}
                            <button
                              onClick={() => handleSaveStock(p.id)}
                              disabled={!isDirty && !isSaved}
                              className={`text-xs px-4 py-2 rounded-xl font-bold transition min-w-[72px] shrink-0 ${
                                isSaved ? "bg-emerald-500 text-white" :
                                isDirty ? "bg-gray-900 text-white hover:bg-black" :
                                "bg-gray-100 text-gray-300 cursor-not-allowed"
                              }`}
                            >
                              {isSaved ? "✓ Saved" : "Save"}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* CUSTOMERS */}
            {activeSection === "customers" && (() => {
              const sorted = [...customers].sort((a, b) => {
                if (customerSort === "name") return a.name.localeCompare(b.name);
                if (customerSort === "orders") return b.totalOrders - a.totalOrders;
                return b.totalSpent - a.totalSpent;
              });
              const topSpender = customers.reduce((max, c) => c.totalSpent > max ? c.totalSpent : max, 0);
              return (
                <div className="space-y-4">
                  {/* HEADER */}
                  <div className="bg-[#0a0a0a] rounded-2xl px-6 py-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-amber-400 uppercase tracking-[0.3em] font-semibold">Directory</p>
                      <h2 className="text-xl font-bold text-white mt-0.5">Customers</h2>
                    </div>
                    <FiUsers className="text-amber-400 text-2xl" />
                  </div>

                  {/* KPI CARDS */}
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Total Customers", value: customers.length, sub: "registered buyers", color: "text-white", accent: "border-white/10" },
                      { label: "Total Revenue", value: `₱${customers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}`, sub: "from all customers", color: "text-amber-400", accent: "border-amber-500/30" },
                      { label: "Avg. Spend", value: `₱${customers.length ? Math.round(customers.reduce((s, c) => s + c.totalSpent, 0) / customers.length).toLocaleString() : 0}`, sub: "per customer", color: "text-emerald-400", accent: "border-emerald-500/30" },
                    ].map((s, i) => (
                      <div key={i} className={`bg-[#111111] rounded-2xl p-5 border ${s.accent}`}>
                        <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-2">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-[11px] text-white/20 mt-1">{s.sub}</p>
                      </div>
                    ))}
                  </div>

                  {/* TABLE */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-[0.2em]">Customer List</p>
                      <div className="flex items-center gap-2">
                        <p className="text-[11px] text-gray-400">Sort by:</p>
                        {(["name", "orders", "spent"] as const).map(s => (
                          <button key={s} onClick={() => setCustomerSort(s)}
                            className={`text-[11px] px-3 py-1 rounded-lg border font-semibold transition ${
                              customerSort === s ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-400 border-gray-200 hover:border-gray-400"
                            }`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {customers.length === 0 ? (
                      <div className="px-6 py-16 text-center">
                        <FiUsers className="text-4xl text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">No customers yet.</p>
                      </div>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="text-left px-6 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">#</th>
                            <th className="text-left px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Customer</th>
                            <th className="text-center px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Orders</th>
                            <th className="text-center px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Last Order</th>
                            <th className="text-center px-4 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Spend Bar</th>
                            <th className="text-right px-6 py-3 text-[10px] tracking-widest uppercase text-gray-400 font-semibold">Total Spent</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {sorted.map((c, i) => {
                            const barPct = topSpender ? Math.round((c.totalSpent / topSpender) * 100) : 0;
                            return (
                              <tr key={c.id} className="hover:bg-gray-50/60 transition">
                                <td className="px-6 py-3.5 text-xs font-bold text-gray-300">{i + 1}</td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                                      <span className="text-sm font-bold text-amber-600">{c.name.charAt(0).toUpperCase()}</span>
                                    </div>
                                    <div>
                                      <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                                      <p className="text-[10px] text-gray-400">{c.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3.5 text-center">
                                  <span className="text-sm font-bold text-gray-800">{c.totalOrders}</span>
                                </td>
                                <td className="px-4 py-3.5 text-center text-xs text-gray-500">{c.lastOrder}</td>
                                <td className="px-4 py-3.5">
                                  <div className="flex items-center gap-2">
                                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                      <div className="h-full bg-amber-400 rounded-full" style={{ width: `${barPct}%` }} />
                                    </div>
                                    <span className="text-[10px] text-gray-300 w-6 text-right">{barPct}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-3.5 text-right font-bold text-[#c9a98a] text-sm">₱{c.totalSpent.toLocaleString()}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="bg-gray-50 border-t-2 border-gray-200">
                            <td colSpan={5} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest">Total Revenue</td>
                            <td className="px-6 py-4 text-right text-base font-bold text-gray-900">₱{customers.reduce((s, c) => s + c.totalSpent, 0).toLocaleString()}</td>
                          </tr>
                        </tfoot>
                      </table>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* REVIEWS */}
            {activeSection === "reviews" && (() => {
              const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "0.0";
              const ratingCounts = [5,4,3,2,1].map(star => ({ star, count: reviews.filter(r => r.rating === star).length }));
              const productMap = new Map<number, { name: string; count: number; avg: number }>();
              reviews.forEach(r => {
                const existing = productMap.get(r.productId);
                const prod = products.find(p => p.id === r.productId);
                if (existing) { existing.count++; existing.avg = (existing.avg * (existing.count - 1) + r.rating) / existing.count; }
                else productMap.set(r.productId, { name: prod?.name ?? `Product #${r.productId}`, count: 1, avg: r.rating });
              });
              return (
                <div className="space-y-4">
                  {/* HEADER */}
                  <div className="bg-[#0a0a0a] rounded-2xl px-6 py-5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-yellow-400 uppercase tracking-[0.3em] font-semibold">Moderation</p>
                      <h2 className="text-xl font-bold text-white mt-0.5">Product Reviews</h2>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-[10px] text-white/30 uppercase tracking-widest">Avg Rating</p>
                        <p className="text-lg font-bold text-yellow-400">{avgRating} ★</p>
                      </div>
                      <FiStar className="text-yellow-400 text-2xl" />
                    </div>
                  </div>

                  {/* KPI + RATING BREAKDOWN */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: "Total Reviews", value: reviews.length, color: "text-white", accent: "border-white/10" },
                        { label: "Avg Rating", value: `${avgRating} ★`, color: "text-yellow-400", accent: "border-yellow-500/30" },
                        { label: "5★ Reviews", value: reviews.filter(r => r.rating === 5).length, color: "text-emerald-400", accent: "border-emerald-500/30" },
                        { label: "1-2★ Reviews", value: reviews.filter(r => r.rating <= 2).length, color: "text-red-400", accent: "border-red-500/30" },
                      ].map((s, i) => (
                        <div key={i} className={`bg-[#111111] rounded-2xl p-4 border ${s.accent}`}>
                          <p className="text-[10px] tracking-[0.25em] uppercase text-white/30 mb-1">{s.label}</p>
                          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="bg-[#111111] rounded-2xl p-5 border border-white/5">
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.25em] font-semibold mb-4">Rating Breakdown</p>
                      <div className="space-y-2">
                        {ratingCounts.map(({ star, count }) => (
                          <div key={star} className="flex items-center gap-3">
                            <span className="text-[11px] text-white/40 w-4 text-right">{star}★</span>
                            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${reviews.length ? Math.round((count / reviews.length) * 100) : 0}%` }} />
                            </div>
                            <span className="text-[11px] text-white/30 w-4">{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* REVIEWS TABLE */}
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                      <p className="text-xs font-bold text-gray-700 uppercase tracking-[0.2em]">All Reviews</p>
                      <p className="text-[11px] text-gray-400">{reviews.length} total</p>
                    </div>
                    {reviews.length === 0 ? (
                      <div className="px-6 py-16 text-center">
                        <FiStar className="text-4xl text-gray-200 mx-auto mb-3" />
                        <p className="text-sm text-gray-400">No reviews yet.</p>
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {reviews.map(r => {
                          const prod = products.find(p => p.id === r.productId);
                          return (
                            <div key={r.id} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50/50 transition">
                              {/* PRODUCT */}
                              <div className="flex items-center gap-3 w-48 shrink-0">
                                {prod && <img src={prod.img} alt={prod.name} className="w-10 h-10 object-cover rounded-xl border border-gray-100 shrink-0" />}
                                <p className="text-xs font-semibold text-gray-700 truncate">{prod?.name ?? `Product #${r.productId}`}</p>
                              </div>
                              {/* REVIEWER */}
                              <div className="w-28 shrink-0">
                                <p className="text-xs font-semibold text-gray-800 truncate">{r.username}</p>
                                <p className="text-[10px] text-gray-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" })}</p>
                              </div>
                              {/* STARS */}
                              <div className="flex items-center gap-0.5 shrink-0">
                                {[1,2,3,4,5].map(s => (
                                  <span key={s} className={`text-sm ${s <= r.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                                ))}
                              </div>
                              {/* COMMENT */}
                              <p className="flex-1 text-sm text-gray-600 min-w-0">{r.comment}</p>
                              {/* DELETE */}
                              <button
                                onClick={() => handleDeleteReview(r.id)}
                                disabled={deletingReview === r.id}
                                className="shrink-0 text-xs text-red-400 hover:text-red-600 border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-lg transition disabled:opacity-50"
                              >
                                {deletingReview === r.id ? "..." : "Delete"}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* CONTACT MESSAGES */}
            {activeSection === "messages" && <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-6 py-4 bg-gray-50 border-b">
                <FiMessageSquare className="text-gray-600" />
                <p className="text-xs tracking-[0.3em] uppercase font-bold text-gray-700">Customer Messages</p>
                {messages.filter(m => !m.read).length > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {messages.filter(m => !m.read).length} new
                  </span>
                )}
              </div>
              {messages.length === 0 ? (
                <div className="px-6 py-10 text-center text-sm text-gray-400 italic">No messages yet.</div>
              ) : (
                <div className="divide-y">
                  {messages.map(m => (
                          <div key={m.id} className={`px-6 py-4 flex flex-wrap items-start gap-4 transition ${!m.read ? "bg-blue-50/40" : ""}`}>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                                {!m.read && <span className="text-[9px] bg-blue-500 text-white px-2 py-0.5 rounded-full font-bold uppercase tracking-widest">New</span>}
                              </div>
                              <p className="text-xs text-gray-400 mb-2">{m.email} &nbsp;·&nbsp; {new Date(m.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.message}</p>
                            </div>
                            <div className="flex flex-col gap-2 shrink-0">
                              {!m.read && (
                                <button
                                  onClick={async () => {
                                    await markMessageRead(m.id);
                                    setMessages(prev => prev.map(x => x.id === m.id ? { ...x, read: true } : x));
                                  }}
                                  className="text-xs bg-black text-white px-3 py-1.5 rounded-lg hover:bg-gray-800 transition font-semibold"
                                >
                                  Mark Read
                                </button>
                              )}
                              <button
                                onClick={() => { setReplyingTo(replyingTo === m.id ? null : m.id); setReplyText(""); }}
                                className="text-xs border border-gray-300 text-gray-600 px-3 py-1.5 rounded-lg hover:border-black transition font-semibold"
                              >
                                {replyingTo === m.id ? "Cancel" : "Reply"}
                              </button>
                            </div>
                            {replyingTo === m.id && (
                              <div className="w-full mt-3 flex flex-col gap-2">
                                <textarea
                                  rows={3}
                                  value={replyText}
                                  onChange={e => setReplyText(e.target.value)}
                                  placeholder="Type your reply..."
                                  className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-black resize-none"
                                />
                                <button
                                  disabled={!replyText.trim() || sendingReply}
                                  onClick={async () => {
                                    setSendingReply(true);
                                    const res = await fetch("/api/reply-message", {
                                      method: "POST",
                                      headers: { "Content-Type": "application/json" },
                                      body: JSON.stringify({ toEmail: m.email, toName: m.name, originalMessage: m.message, replyText, userId: m.userId }),
                                    });
                                    if (res.ok) {
                                      await saveMessageReply(m.id, replyText);
                                      setReplyingTo(null);
                                      setReplyText("");
                                      setMessages(prev => prev.map(x => x.id === m.id ? { ...x, read: true, adminReply: replyText } : x));
                                    } else {
                                      alert("Failed to send reply.");
                                    }
                                    setSendingReply(false);
                                  }}
                                  className="self-end text-xs bg-black text-white px-4 py-1.5 rounded-lg hover:bg-gray-800 transition font-semibold disabled:opacity-50"
                                >
                                  {sendingReply ? "Sending..." : "Send Reply"}
                                </button>
                              </div>
                            )}
                          </div>
                  ))}
                </div>
              )}
            </div>}

            {/* ORDERS */}
            {activeSection === "orders" && (filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center">
                <FiPackage className="text-5xl text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400">No orders found.</p>
              </div>
            ) : <>{visibleFiltered.map((order, i) => (
              <motion.div
                key={order.orderNumber}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm"
              >
                {/* TOP BAR */}
                <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-b border-gray-100 flex-wrap gap-3">
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
                      <p className="text-[11px] text-gray-400 mt-0.5">{order.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {isArrivingToday(order) && (
                      <span className="text-[10px] bg-rose-500 text-white px-2.5 py-1 rounded-full font-bold uppercase tracking-wide animate-pulse">
                        🚚 Arriving Today
                      </span>
                    )}
                    {/* PAYMENT STATUS BADGE */}
                    {order.paymentMethod === "gcash" && (
                      <button
                        onClick={() => handlePaymentToggle(order.orderNumber, order.paymentStatus)}
                        className={`text-xs px-3 py-1 rounded-full font-semibold border transition ${
                          order.paymentStatus === "paid"
                            ? "bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                            : "bg-red-50 text-red-500 border-red-200 hover:bg-red-100"
                        }`}
                      >
                        GCash: {order.paymentStatus === "paid" ? "✓ Paid" : "✕ Unpaid — click to mark paid"}
                      </button>
                    )}
                    {order.paymentMethod === "cod" && (
                      <span className="text-xs px-3 py-1 rounded-full font-semibold border bg-gray-50 text-gray-500 border-gray-200">COD</span>
                    )}
                    {/* ORDER STATUS DROPDOWN */}
                    <select
                      value={order.status}
                      disabled={updatingOrder === order.orderNumber}
                      onChange={e => handleStatusChange(order.orderNumber, e.target.value as OrderStatus)}
                      className={`text-xs px-3 py-1.5 rounded-full font-semibold border outline-none cursor-pointer transition ${STATUS_STYLE[order.status]}`}
                    >
                      {STATUS_FLOW.map(s => (
                        <option key={s} value={s}>{STATUS_LABEL[s]}</option>
                      ))}
                    </select>
                    <span className="text-base font-bold text-gray-800">₱{order.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* BODY */}
                <div className="px-6 py-5">
                  <div className="flex items-start gap-6 flex-wrap">
                    {/* PRODUCT IMAGES */}
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

                    {/* CUSTOMER INFO */}
                    <div className="flex-1 min-w-[200px]">
                      <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-2">Customer</p>
                      <p className="text-sm font-semibold text-gray-800">{order.customerName ?? "—"}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{order.customerPhone ?? "—"}</p>
                      <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{order.customerAddress ?? "—"}</p>
                    </div>

                    <div className="h-14 w-px bg-gray-100 shrink-0" />

                    {/* GCASH PROOF */}
                    {order.paymentMethod === "gcash" && (
                      <div className="shrink-0">
                        <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-2">GCash Proof</p>
                        {order.gcashProofUrl ? (
                          <button onClick={() => setProofModal({ url: order.gcashProofUrl!, orderNumber: order.orderNumber, paymentStatus: order.paymentStatus })}>
                            <img src={order.gcashProofUrl} alt="GCash proof" className="w-20 h-20 object-cover rounded-xl border-2 border-blue-200 hover:border-blue-400 hover:opacity-80 transition" />
                            <p className="text-[10px] text-blue-400 mt-1 text-center">Click to verify</p>
                          </button>
                        ) : (
                          <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-[10px] text-gray-400 text-center px-1">
                            No proof uploaded
                          </div>
                        )}
                      </div>
                    )}

                    <div className="h-14 w-px bg-gray-100 shrink-0" />

                    {/* SUMMARY */}
                    <div className="grid grid-cols-3 gap-3 text-center flex-1 min-w-[200px]">
                      <div className="bg-gray-50 rounded-xl py-2">
                        <p className="text-[10px] tracking-widest uppercase text-gray-400">Items</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">{order.items.length}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl py-2">
                        <p className="text-[10px] tracking-widest uppercase text-gray-400">Shipping</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">₱{order.shipping.toLocaleString()}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl py-2">
                        <p className="text-[10px] tracking-widest uppercase text-gray-400">Total</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">₱{order.total.toLocaleString()}</p>
                      </div>
                    </div>
                  </div>

                  {/* TOGGLE DETAILS */}
                  <div className="mt-4 pt-4 border-t border-gray-50">
                    <button
                      onClick={() => setOpenOrder(openOrder === order.orderNumber ? null : order.orderNumber)}
                      className="flex items-center gap-1 text-xs text-gray-400 hover:text-black transition"
                    >
                      {openOrder === order.orderNumber ? <><FiChevronUp /> Hide Items</> : <><FiChevronDown /> View Items</>}
                    </button>
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
                                {(item.qty ?? 1) > 1 && <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded">x{item.qty}</span>}
                              </div>
                            </div>
                            <p className="text-sm font-bold text-[#c9a98a]">₱{(item.price * (item.qty ?? 1)).toLocaleString()}</p>
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
            {visibleCount < filtered.length && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={() => setVisibleCount(v => v + 10)}
                  className="px-10 py-3 border-2 border-black text-sm font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition"
                >
                  Load More ({filtered.length - visibleCount} remaining)
                </button>
              </div>
            )}
            </>)}
          </>
        )}
        </div>
      </main>

      {/* GCASH VERIFICATION MODAL */}
      <AnimatePresence>
        {proofModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-6"
            onClick={() => setProofModal(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl overflow-hidden shadow-2xl max-w-lg w-full"
            >
              {/* MODAL HEADER */}
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <div>
                  <p className="text-xs tracking-widest uppercase text-gray-400">GCash Verification</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">Order #{proofModal.orderNumber}</p>
                </div>
                <button onClick={() => setProofModal(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                  <FiX className="text-gray-500 text-sm" />
                </button>
              </div>

              {/* PROOF IMAGE */}
              <div className="p-4 bg-gray-50">
                <img
                  src={proofModal.url}
                  alt="GCash proof"
                  className="w-full max-h-[50vh] object-contain rounded-xl"
                />
                <a
                  href={proofModal.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-center text-xs text-blue-400 hover:underline mt-2"
                >
                  Open full image ↗
                </a>
              </div>

              {/* ACTIONS */}
              <div className="px-6 py-4 flex gap-3">
                {proofModal.paymentStatus === "unpaid" ? (
                  <>
                    <button
                      onClick={async () => {
                        await handlePaymentToggle(proofModal.orderNumber, "unpaid");
                        setProofModal(null);
                      }}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
                    >
                      <FiCheckCircle /> Verify & Mark Paid
                    </button>
                    <button
                      onClick={() => setProofModal(null)}
                      className="flex-1 border border-gray-200 text-gray-500 text-sm font-semibold py-3 rounded-xl hover:border-gray-400 transition"
                    >
                      Review Later
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex-1 bg-green-50 border border-green-200 text-green-600 text-sm font-semibold py-3 rounded-xl flex items-center justify-center gap-2">
                      <FiCheckCircle /> Already Verified & Paid
                    </div>
                    <button
                      onClick={async () => {
                        await handlePaymentToggle(proofModal.orderNumber, "paid");
                        setProofModal(null);
                      }}
                      className="border border-red-200 text-red-400 text-sm font-semibold px-4 py-3 rounded-xl hover:border-red-400 transition"
                    >
                      Unmark
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ARRIVING TODAY TOAST */}
      <AnimatePresence>
        {arrivingToast && arrivingTodayOrders.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-6 left-6 z-[9999] bg-white border border-rose-200 rounded-2xl shadow-2xl p-4 w-80"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
                <FiTruck className="text-white text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">Arriving Today</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">
                  {arrivingTodayOrders.length} order{arrivingTodayOrders.length > 1 ? "s" : ""} expected today
                </p>
                <div className="mt-1.5 space-y-1">
                  {arrivingTodayOrders.slice(0, 3).map(o => (
                    <p key={o.orderNumber} className="text-[11px] text-gray-500 truncate">
                      #{o.orderNumber} · {o.customerName} · ₱{o.total.toLocaleString()}
                    </p>
                  ))}
                  {arrivingTodayOrders.length > 3 && (
                    <p className="text-[11px] text-gray-400">+{arrivingTodayOrders.length - 3} more</p>
                  )}
                </div>
              </div>
              <button onClick={() => setArrivingToast(false)} className="text-gray-300 hover:text-gray-600 transition shrink-0">
                <FiX className="text-sm" />
              </button>
            </div>
            <button
              onClick={() => { setActiveSection("orders"); setArrivingToast(false); }}
              className="mt-3 w-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold py-2 rounded-xl transition"
            >
              View Orders
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* NEW ORDER TOAST */}
      <AnimatePresence>
        {newOrderToast && (
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ duration: 0.35 }}
            className="fixed bottom-6 right-6 z-[9999] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 w-80"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center shrink-0">
                <FiPackage className="text-white text-base" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-rose-500 font-bold uppercase tracking-widest">New Order Received!</p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">Order #{newOrderToast.orderNumber}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{newOrderToast.customerName} · ₱{newOrderToast.total.toLocaleString()}</p>
                <p className="text-[10px] text-gray-400 mt-1">{newOrderToast.items.length} item{newOrderToast.items.length > 1 ? "s" : ""} · {newOrderToast.paymentMethod?.toUpperCase()}</p>
              </div>
              <button onClick={() => setNewOrderToast(null)} className="text-gray-300 hover:text-gray-600 transition shrink-0">
                <FiX className="text-sm" />
              </button>
            </div>
            <button
              onClick={() => { setActiveSection("orders"); setNewOrderToast(null); }}
              className="mt-3 w-full bg-gray-900 hover:bg-black text-white text-xs font-bold py-2 rounded-xl transition"
            >
              View Orders
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
