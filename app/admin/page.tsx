"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiPackage, FiCheckCircle, FiChevronDown, FiChevronUp, FiClock, FiShield, FiSearch, FiTruck, FiX, FiAlertTriangle, FiBarChart2 } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { getAllOrders, updateOrderStatus, updatePaymentStatus, getAllRefundRequests, updateRefundStatus, Order, OrderStatus, PaymentStatus, RefundRequest, isAdmin } from "@/lib/orders";
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
  const [dismissedAlert, setDismissedAlert] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportSort, setReportSort] = useState<"name" | "stock" | "value">("stock");
  const [showAnalytics, setShowAnalytics] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "all">("all");
  const [filterPayment, setFilterPayment] = useState<PaymentStatus | "all">("all");
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [proofModal, setProofModal] = useState<{ url: string; orderNumber: string; paymentStatus: PaymentStatus } | null>(null);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const { products, loading: productsLoading } = useProducts();

  useEffect(() => {
    const check = async () => {
      const admin = await isAdmin();
      if (!admin) { router.push("/admin/login"); return; }
      setAuthorized(true);
      const data = await getAllOrders();
      setOrders(data);
      const refundData = await getAllRefundRequests();
      setRefunds(refundData);
      const sm = await getStockMap();
      setStockMapState(sm);
      setEditingStock(sm);
      setLoading(false);
    };
    check();
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
            body: JSON.stringify({ email, orderNumber, status, total: order.total, items: order.items, customerName: order.customerName, customerAddress: order.customerAddress, expectedDelivery: order.expectedDelivery }),
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

  const handleSaveAllStock = async () => {
    const results = await Promise.all(Object.entries(editingStock).map(([id, qty]) => setStock(Number(id), qty)));
    const failed = results.find(r => r.error);
    if (failed) { alert(`Failed to save stock: ${failed.error}`); return; }
    setStockMapState({ ...editingStock });
    const allSaved = Object.fromEntries(Object.keys(editingStock).map(id => [id, true]));
    setSavedStock(allSaved);
    setTimeout(() => setSavedStock({}), 2000);
  };

  const filtered = orders.filter(o => {
    const matchSearch = search.trim() === "" ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      (o.customerName ?? "").toLowerCase().includes(search.toLowerCase()) ||
      (o.customerPhone ?? "").includes(search);
    const matchStatus = filterStatus === "all" || o.status === filterStatus;
    const matchPayment = filterPayment === "all" || o.paymentStatus === filterPayment;
    return matchSearch && matchStatus && matchPayment;
  });

  const visibleFiltered = filtered.slice(0, visibleCount);

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

  return (
    <div className="min-h-screen bg-[#f5f5f5]">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white border-b border-gray-100">
        <Link href="/" className="text-3xl font-serif italic">Chay Fashion</Link>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 bg-gray-100 px-4 py-2 rounded-full">
            <FiShield className="text-black" /> Admin Panel
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push("/admin/login"); }}
            className="text-xs text-red-500 hover:text-red-700 border border-red-200 hover:border-red-400 px-4 py-2 rounded-full transition font-semibold"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div className="bg-black text-white py-10 px-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('/BG.jpg')] bg-cover bg-center animate-kenburns" />
        <div className="relative max-w-6xl mx-auto">
          <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Admin</span>
          <h1 className="text-4xl font-bold mt-1 mb-6">Order Management</h1>
          <div className="flex gap-8 flex-wrap">
            {[
              { label: "Total Orders", value: counts.total, color: "text-white" },
              { label: "Pending", value: counts.pending, color: "text-yellow-400" },
              { label: "Processing", value: counts.processing, color: "text-blue-400" },
              { label: "Shipped", value: counts.shipped, color: "text-purple-400" },
              { label: "Delivered", value: counts.delivered, color: "text-green-400" },
              { label: "GCash Unpaid", value: counts.unpaid, color: "text-red-400" },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                {i > 0 && <div className="w-px h-8 bg-white/10" />}
                <div>
                  <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-gray-400 tracking-widest uppercase mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-6">
        {loading || productsLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ANALYTICS DASHBOARD */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowAnalytics(v => !v)}
                className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 border-b hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="text-gray-600" />
                  <p className="text-xs tracking-[0.3em] uppercase font-bold text-gray-700">Sales Analytics</p>
                </div>
                {showAnalytics ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
              </button>
              <AnimatePresence>
                {showAnalytics && (() => {
                  const delivered = orders.filter(o => o.status === "delivered");
                  const totalRevenue = delivered.reduce((s, o) => s + o.total, 0);
                  const totalOrders = orders.length;
                  const avgOrderValue = delivered.length ? Math.round(totalRevenue / delivered.length) : 0;
                  const cancelRate = totalOrders ? Math.round((orders.filter(o => o.status === "cancelled").length / totalOrders) * 100) : 0;

                  // top products by quantity sold
                  const productSales: Record<number, { name: string; img: string; qty: number; revenue: number }> = {};
                  delivered.forEach(o => o.items.forEach(item => {
                    if (!productSales[item.id]) productSales[item.id] = { name: item.name, img: item.img, qty: 0, revenue: 0 };
                    productSales[item.id].qty += item.qty ?? 1;
                    productSales[item.id].revenue += item.price * (item.qty ?? 1);
                  }));
                  const topProducts = Object.entries(productSales)
                    .sort((a, b) => b[1].qty - a[1].qty)
                    .slice(0, 5);

                  // sales by category
                  const categorySales: Record<string, number> = {};
                  delivered.forEach(o => o.items.forEach(item => {
                    categorySales[item.category] = (categorySales[item.category] ?? 0) + item.price * (item.qty ?? 1);
                  }));
                  const totalCatRevenue = Object.values(categorySales).reduce((s, v) => s + v, 0);

                  // payment method breakdown
                  const gcashOrders = orders.filter(o => o.paymentMethod === "gcash").length;
                  const codOrders = orders.filter(o => o.paymentMethod === "cod").length;

                  return (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      {/* KPI CARDS */}
                      <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-50">
                        {[
                          { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, sub: "from delivered orders", color: "text-[#c9a98a]" },
                          { label: "Total Orders", value: totalOrders, sub: `${delivered.length} delivered`, color: "text-gray-800" },
                          { label: "Avg Order Value", value: `₱${avgOrderValue.toLocaleString()}`, sub: "per delivered order", color: "text-blue-600" },
                          { label: "Cancellation Rate", value: `${cancelRate}%`, sub: `${orders.filter(o => o.status === "cancelled").length} cancelled`, color: cancelRate > 20 ? "text-red-500" : "text-green-600" },
                        ].map((k, i) => (
                          <div key={i} className="bg-gray-50 rounded-xl p-4">
                            <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-1">{k.label}</p>
                            <p className={`text-2xl font-bold ${k.color}`}>{k.value}</p>
                            <p className="text-[10px] text-gray-400 mt-1">{k.sub}</p>
                          </div>
                        ))}
                      </div>

                      <div className="grid grid-cols-2 gap-6 p-6">
                        {/* TOP PRODUCTS */}
                        <div>
                          <p className="text-xs tracking-widest uppercase text-gray-400 font-semibold mb-4">Top Selling Products</p>
                          {topProducts.length === 0 ? (
                            <p className="text-xs text-gray-300 italic">No sales data yet.</p>
                          ) : (
                            <div className="space-y-3">
                              {topProducts.map(([id, p], i) => (
                                <div key={id} className="flex items-center gap-3">
                                  <span className="text-xs font-bold text-gray-300 w-4">{i + 1}</span>
                                  <img src={p.img} alt={p.name} className="w-9 h-9 object-cover rounded-lg shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                                    <p className="text-[10px] text-gray-400">{p.qty} sold &nbsp;·&nbsp; ₱{p.revenue.toLocaleString()}</p>
                                  </div>
                                  <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#c9a98a] rounded-full"
                                      style={{ width: `${Math.round((p.qty / topProducts[0][1].qty) * 100)}%` }}
                                    />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* CATEGORY + PAYMENT BREAKDOWN */}
                        <div className="space-y-6">
                          <div>
                            <p className="text-xs tracking-widest uppercase text-gray-400 font-semibold mb-4">Revenue by Category</p>
                            {Object.keys(categorySales).length === 0 ? (
                              <p className="text-xs text-gray-300 italic">No sales data yet.</p>
                            ) : (
                              <div className="space-y-2">
                                {Object.entries(categorySales)
                                  .sort((a, b) => b[1] - a[1])
                                  .map(([cat, rev]) => (
                                    <div key={cat}>
                                      <div className="flex justify-between text-xs mb-1">
                                        <span className="text-gray-600 font-medium">{cat}</span>
                                        <span className="text-gray-400">₱{rev.toLocaleString()} ({totalCatRevenue ? Math.round((rev / totalCatRevenue) * 100) : 0}%)</span>
                                      </div>
                                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-black rounded-full"
                                          style={{ width: `${totalCatRevenue ? Math.round((rev / totalCatRevenue) * 100) : 0}%` }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="text-xs tracking-widest uppercase text-gray-400 font-semibold mb-4">Payment Methods</p>
                            <div className="flex gap-4">
                              <div className="flex-1 bg-blue-50 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-blue-600">{gcashOrders}</p>
                                <p className="text-[10px] text-blue-400 uppercase tracking-widest mt-0.5">GCash</p>
                              </div>
                              <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                                <p className="text-lg font-bold text-gray-700">{codOrders}</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">COD</p>
              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })()}
              </AnimatePresence>
            </div>

            {/* LOW STOCK ALERT BANNER */}
            {!dismissedAlert && products.some(p => (stockMap[p.id] ?? 0) <= LOW_STOCK_THRESHOLD) && (
              <div className="bg-orange-50 border border-orange-200 rounded-2xl px-6 py-4 flex items-start gap-4">
                <FiAlertTriangle className="text-orange-500 text-xl shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-bold text-orange-700 mb-1">Low Stock Alert</p>
                  <div className="flex flex-wrap gap-2">
                    {products.filter(p => (stockMap[p.id] ?? 0) === 0).map(p => (
                      <span key={p.id} className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-1 rounded-full">
                        {p.name} — Out of Stock
                      </span>
                    ))}
                    {products.filter(p => (stockMap[p.id] ?? 0) > 0 && (stockMap[p.id] ?? 0) <= LOW_STOCK_THRESHOLD).map(p => (
                      <span key={p.id} className="text-xs bg-orange-100 text-orange-600 font-semibold px-2 py-1 rounded-full">
                        {p.name} — {stockMap[p.id]} left
                      </span>
                    ))}
                  </div>
                </div>
                <button onClick={() => setDismissedAlert(true)} className="text-orange-400 hover:text-orange-600 transition shrink-0">
                  <FiX />
                </button>
              </div>
            )}

            {/* INVENTORY REPORT */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <button
                onClick={() => setShowReport(v => !v)}
                className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 border-b hover:bg-gray-100 transition"
              >
                <div className="flex items-center gap-2">
                  <FiBarChart2 className="text-gray-600" />
                  <p className="text-xs tracking-[0.3em] uppercase font-bold text-gray-700">Inventory Report</p>
                </div>
                {showReport ? <FiChevronUp className="text-gray-400" /> : <FiChevronDown className="text-gray-400" />}
              </button>
              <AnimatePresence>
                {showReport && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    {/* SUMMARY CARDS */}
                    <div className="grid grid-cols-4 gap-4 p-6 border-b border-gray-50">
                      {[
                        { label: "Total Products", value: products.length, color: "text-gray-800" },
                        { label: "In Stock", value: products.filter(p => (stockMap[p.id] ?? 0) > LOW_STOCK_THRESHOLD).length, color: "text-green-600" },
                        { label: "Low Stock", value: products.filter(p => (stockMap[p.id] ?? 0) > 0 && (stockMap[p.id] ?? 0) <= LOW_STOCK_THRESHOLD).length, color: "text-orange-500" },
                        { label: "Out of Stock", value: products.filter(p => (stockMap[p.id] ?? 0) === 0).length, color: "text-red-500" },
                      ].map((s, i) => (
                        <div key={i} className="bg-gray-50 rounded-xl p-4 text-center">
                          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                          <p className="text-[10px] tracking-widest uppercase text-gray-400 mt-1">{s.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* SORT CONTROLS */}
                    <div className="px-6 pt-4 pb-2 flex items-center gap-3">
                      <p className="text-xs text-gray-400 uppercase tracking-widest">Sort by:</p>
                      {(["name", "stock", "value"] as const).map(s => (
                        <button
                          key={s}
                          onClick={() => setReportSort(s)}
                          className={`text-xs px-3 py-1 rounded-full border font-semibold transition ${
                            reportSort === s ? "bg-black text-white border-black" : "bg-white text-gray-500 border-gray-200 hover:border-black"
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>

                    {/* TABLE */}
                    <div className="px-6 pb-6">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-[10px] tracking-widest uppercase text-gray-400 border-b border-gray-100">
                            <th className="text-left py-2 font-medium">Product</th>
                            <th className="text-left py-2 font-medium">Category</th>
                            <th className="text-center py-2 font-medium">Stock</th>
                            <th className="text-center py-2 font-medium">Price</th>
                            <th className="text-right py-2 font-medium">Stock Value</th>
                            <th className="text-center py-2 font-medium">Status</th>
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
                              return (
                                <tr key={p.id} className="hover:bg-gray-50/50 transition">
                                  <td className="py-3 flex items-center gap-2">
                                    <img src={p.img} alt={p.name} className="w-8 h-8 object-cover rounded-lg shrink-0" />
                                    <span className="font-medium text-gray-800 truncate max-w-[160px]">{p.name}</span>
                                  </td>
                                  <td className="py-3 text-gray-400 text-xs">{p.category}</td>
                                  <td className="py-3 text-center font-bold text-gray-800">{qty}</td>
                                  <td className="py-3 text-center text-gray-500">₱{p.price.toLocaleString()}</td>
                                  <td className="py-3 text-right font-semibold text-[#c9a98a]">₱{value.toLocaleString()}</td>
                                  <td className="py-3 text-center">
                                    <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${
                                      qty === 0 ? "bg-red-100 text-red-500" :
                                      qty <= LOW_STOCK_THRESHOLD ? "bg-orange-100 text-orange-500" :
                                      "bg-green-100 text-green-600"
                                    }`}>
                                      {qty === 0 ? "Out" : qty <= LOW_STOCK_THRESHOLD ? "Low" : "OK"}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                        <tfoot className="border-t-2 border-gray-200">
                          <tr>
                            <td colSpan={4} className="py-3 text-xs font-bold text-gray-500 uppercase tracking-widest">Total Inventory Value</td>
                            <td className="py-3 text-right text-base font-bold text-gray-800">
                              ₱{products.reduce((sum, p) => sum + (stockMap[p.id] ?? 0) * p.price, 0).toLocaleString()}
                            </td>
                            <td />
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* STOCK MANAGEMENT */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                <div>
                  <p className="text-xs tracking-[0.3em] uppercase font-bold text-gray-700">Stock Management</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {products.filter(p => (stockMap[p.id] ?? 0) === 0).length} out of stock &nbsp;·&nbsp;
                    {products.filter(p => (stockMap[p.id] ?? 0) > 0 && (stockMap[p.id] ?? 0) <= 3).length} low stock
                  </p>
                </div>
                <button
                  onClick={handleSaveAllStock}
                  className="bg-black text-white text-xs px-4 py-2 rounded-lg hover:bg-gray-800 transition font-semibold"
                >
                  Save All
                </button>
              </div>
              <div className="divide-y">
                {products.map((p) => {
                  const current = stockMap[p.id] ?? 0;
                  const editing = editingStock[p.id] ?? 0;
                  const isDirty = editing !== current;
                  const isSaved = savedStock[p.id];
                  return (
                    <div key={p.id} className={`flex items-center justify-between px-6 py-3 transition ${
                      current === 0 ? "bg-red-50/40" : current <= 3 ? "bg-orange-50/40" : ""
                    }`}>
                      <div className="flex items-center gap-3">
                        <img src={p.img} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                        <div>
                          <p className="text-sm font-medium">{p.name}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest">{p.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs px-2 py-1 rounded-full font-semibold ${
                          current === 0 ? "bg-red-100 text-red-500" :
                          current <= 3 ? "bg-orange-100 text-orange-500" :
                          "bg-green-100 text-green-600"
                        }`}>
                          {current === 0 ? "Out of Stock" : current <= 3 ? `⚠ ${current} left` : `${current} in stock`}
                        </span>
                        {/* +/- CONTROLS */}
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button
                            onClick={() => setEditingStock(prev => ({ ...prev, [p.id]: Math.max(0, (prev[p.id] ?? 0) - 1) }))}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition text-sm font-bold"
                          >−</button>
                          <input
                            type="number" min={0}
                            value={editingStock[p.id] ?? 0}
                            onChange={(e) => setEditingStock(prev => ({ ...prev, [p.id]: Math.max(0, Number(e.target.value)) }))}
                            className="w-14 text-sm text-center outline-none py-1 border-x border-gray-200"
                          />
                          <button
                            onClick={() => setEditingStock(prev => ({ ...prev, [p.id]: (prev[p.id] ?? 0) + 1 }))}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-100 transition text-sm font-bold"
                          >+</button>
                        </div>
                        <button
                          onClick={() => handleSaveStock(p.id)}
                          disabled={!isDirty && !isSaved}
                          className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition min-w-[60px] ${
                            isSaved
                              ? "bg-green-500 text-white"
                              : isDirty
                              ? "bg-black text-white hover:bg-gray-800"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {isSaved ? "✓ Saved" : "Save"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* REFUND REQUESTS */}
            {refunds.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b flex items-center justify-between">
                  <div>
                    <p className="text-xs tracking-[0.3em] uppercase font-bold text-gray-700">Refund / Return Requests</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">{refunds.filter(r => r.status === "pending").length} pending</p>
                  </div>
                </div>
                <div className="divide-y">
                  {refunds.map(r => (
                    <div key={r.id} className="flex items-center justify-between px-6 py-4 flex-wrap gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-800">Order #{r.orderNumber}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{r.customerName} &nbsp;&middot;&nbsp; {r.paymentMethod === "gcash" ? "GCash" : "COD"} &nbsp;&middot;&nbsp; ₱{r.total.toLocaleString()}</p>
                        <p className="text-xs text-gray-400 mt-1 italic">"{r.reason}"</p>
                        <p className="text-[10px] text-gray-300 mt-0.5">{new Date(r.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {r.status === "pending" ? (
                          <>
                            <button
                              onClick={async () => {
                                await updateRefundStatus(r.id, "approved");
                                setRefunds(prev => prev.map(x => x.id === r.id ? { ...x, status: "approved" } : x));
                                const order = orders.find(o => o.orderNumber === r.orderNumber);
                                if (order?.userId) {
                                  const { data: profile } = await supabase.from("profiles").select("email").eq("id", order.userId).maybeSingle();
                                  if (profile?.email) {
                                    try {
                                      await fetch("/api/send-refund-email", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ email: profile.email, customerName: r.customerName, orderNumber: r.orderNumber, total: r.total, status: "approved", reason: r.reason }),
                                      });
                                    } catch (e) { console.error("Refund email failed:", e); }
                                  }
                                }
                              }}
                              className="bg-green-500 hover:bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={async () => {
                                await updateRefundStatus(r.id, "rejected");
                                setRefunds(prev => prev.map(x => x.id === r.id ? { ...x, status: "rejected" } : x));
                                const order = orders.find(o => o.orderNumber === r.orderNumber);
                                if (order?.userId) {
                                  const { data: profile } = await supabase.from("profiles").select("email").eq("id", order.userId).maybeSingle();
                                  if (profile?.email) {
                                    try {
                                      await fetch("/api/send-refund-email", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ email: profile.email, customerName: r.customerName, orderNumber: r.orderNumber, total: r.total, status: "rejected", reason: r.reason }),
                                      });
                                    } catch (e) { console.error("Refund email failed:", e); }
                                  }
                                }
                              }}
                              className="border border-red-200 text-red-400 hover:border-red-400 text-xs font-bold px-4 py-2 rounded-xl transition"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <span className={`text-xs px-3 py-1.5 rounded-full font-semibold border ${
                            r.status === "approved"
                              ? "bg-green-50 text-green-600 border-green-200"
                              : "bg-red-50 text-red-500 border-red-200"
                          }`}>
                            {r.status === "approved" ? "✓ Approved" : "✕ Rejected"}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* FILTERS */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-6 py-4 flex flex-wrap gap-4 items-center">
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 gap-2 flex-1 min-w-[200px]">
                <FiSearch className="text-gray-400 shrink-0" />
                <input
                  type="text" value={search} onChange={e => { setSearch(e.target.value); setVisibleCount(10); }}
                  placeholder="Search by order #, name, phone..."
                  className="text-xs outline-none bg-transparent flex-1 placeholder-gray-400"
                />
                {search && <button onClick={() => setSearch("")}><FiX className="text-gray-400 text-xs" /></button>}
              </div>
              <select
                value={filterStatus}
                onChange={e => { setFilterStatus(e.target.value as OrderStatus | "all"); setVisibleCount(10); }}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black"
              >
                <option value="all">All Statuses</option>
                {STATUS_FLOW.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
              </select>
              <select
                value={filterPayment}
                onChange={e => { setFilterPayment(e.target.value as PaymentStatus | "all"); setVisibleCount(10); }}
                className="border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black"
              >
                <option value="all">All Payments</option>
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
              <span className="text-xs text-gray-400 tracking-widest uppercase">{filtered.length} orders</span>
            </div>

            {/* ORDERS */}
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-16 text-center">
                <FiPackage className="text-5xl text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400">No orders found.</p>
              </div>
            ) : visibleFiltered.map((order, i) => (
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
          </>
        )}
      </div>

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
    </div>
  );
}
