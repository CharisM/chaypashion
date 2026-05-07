"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiUser, FiShoppingCart, FiMenu, FiX, FiBell, FiPackage, FiMessageSquare } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { getCart } from "@/lib/cart";
import { getNotifications, markAllRead, subscribeNotifications, Notification } from "@/lib/notifications";
import { getUserMessages, ContactMessage, markUserMessagesRead } from "@/lib/orders";
import { AnimatePresence, motion } from "framer-motion";

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toast, setToast] = useState<Notification | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.filter(n => !n.read).length;
  const [unreadMessages, setUnreadMessages] = useState(0);

  useEffect(() => {
    const getUser = async (user: any) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
        setUsername(data?.username || user.user_metadata?.full_name || user.email?.split("@")[0] || null);
        setUserId(user.id);
        setCartCount(getCart(user.id).length);
      } else {
        setUsername(null);
        setUserId(null);
      }
      setLoaded(true);
    };
    supabase.auth.getSession().then(({ data: { session } }) => getUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") getUser(session?.user ?? null);
      else if (event === "SIGNED_OUT") { setUsername(null); setUserId(null); setNotifications([]); setLoaded(true); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) return;
    getUserMessages(userId).then(msgs => {
      setUnreadMessages(msgs.filter(m => m.adminReply && !m.read).length);
    });
    getNotifications(userId).then(setNotifications);
    const unsub = subscribeNotifications(userId, (n) => {
      setNotifications(prev => [n, ...prev]);
      if (n.type === "message") setUnreadMessages(prev => prev + 1);
      // show toast popup
      if (toastTimer.current) clearTimeout(toastTimer.current);
      setToast(n);
      toastTimer.current = setTimeout(() => setToast(null), 5000);
    });
    return unsub;
  }, [userId]);

  useEffect(() => {
    setCartCount(getCart(userId ?? undefined).length);
  }, [loaded, userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node))
        setNotifOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotifOpen = async () => {
    setNotifOpen(o => !o);
    if (!notifOpen && userId && unreadCount > 0) {
      await markAllRead(userId);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) { router.push(`/search?q=${encodeURIComponent(search.trim())}`); setMobileOpen(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsername(null);
    setDropdown(false);
    setMobileOpen(false);
    window.location.href = "/";
  };

  return (
    <nav className="bg-white shadow-sm relative z-50">
      <div className="flex justify-between items-center px-6 md:px-12 py-4">

        {/* LOGO */}
        <Link href="/" className="text-2xl md:text-3xl font-serif italic shrink-0">Chay Fashion</Link>

        {/* DESKTOP NAV */}
        <ul className="hidden md:flex gap-8 text-sm font-medium items-center">
          <li><Link href="/" className="hover:text-gray-500 transition">HOME</Link></li>
          <li><Link href="/about" className="hover:text-gray-500 transition">ABOUT</Link></li>
          <li><Link href="/contact" className="hover:text-gray-500 transition">CONTACT</Link></li>
          <li>
            <Link href="/cart" className="relative flex items-center hover:opacity-70 transition">
              <FiShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </li>
          {username && (
            <li>
              <Link href="/messages" className="relative flex items-center hover:opacity-70 transition" onClick={() => { setUnreadMessages(0); if (userId) markUserMessagesRead(userId); }}>
                <FiMessageSquare className="text-xl" />
                {unreadMessages > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>
            </li>
          )}
          {username && (
            <li className="relative" ref={notifRef}>
              <button onClick={handleNotifOpen} className="relative flex items-center hover:opacity-70 transition">
                <FiBell className="text-xl" />
                {unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-100 rounded-2xl shadow-xl z-[999] overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <p className="text-xs font-bold tracking-widest uppercase text-gray-700">Notifications</p>
                    <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-black transition"><FiX className="text-sm" /></button>
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <FiBell className="text-3xl text-gray-200 mx-auto mb-2" />
                        <p className="text-xs text-gray-400">No notifications yet</p>
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 flex gap-3 items-start transition ${!n.read ? "bg-blue-50/50" : ""}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? "bg-blue-500" : "bg-gray-200"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                          <p className="text-[10px] text-gray-300 mt-1">{new Date(n.createdAt).toLocaleString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-100 flex items-center justify-between">
                      <Link href="/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-gray-400 hover:text-black transition">View all →</Link>
                      {unreadCount > 0 && (
                        <button onClick={handleNotifOpen} className="text-xs text-blue-500 hover:text-blue-700 transition font-medium">Mark all read</button>
                      )}
                    </div>
                </div>
              )}
            </li>
          )}
          <li className="relative">
            <div ref={dropdownRef}>
              <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 hover:opacity-80 transition">
                <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                  <FiUser className="text-white text-lg" />
                </div>
                {loaded && username && <span className="text-sm font-medium truncate max-w-[100px]">{username}</span>}
              </button>
              {dropdown && (
                <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-[999] overflow-hidden">
                  {username ? (
                    <>
                      <Link href="/profile" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                      <Link href="/orders" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">My Orders</Link>
                      <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">Logout</button>
                    </>
                  ) : (
                    <Link href="/login" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Login</Link>
                  )}
                </div>
              )}
            </div>
          </li>
        </ul>

        {/* MOBILE RIGHT ICONS */}
        <div className="flex md:hidden items-center gap-4">
          <Link href="/cart" className="relative flex items-center">
            <FiShoppingCart className="text-xl" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-2xl">
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-full px-3 py-2 gap-2">
            <FiSearch className="text-gray-400 text-sm shrink-0" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="text-sm outline-none bg-transparent flex-1 placeholder-gray-400" />
          </form>
          <Link href="/" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2 border-b border-gray-50">HOME</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2 border-b border-gray-50">ABOUT</Link>
          <Link href="/contact" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2 border-b border-gray-50">CONTACT</Link>
          {username ? (
            <>
          <Link href="/notifications" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2 border-b border-gray-50 flex items-center justify-between">
              Notifications
              {unreadCount > 0 && <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
            </Link>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2 border-b border-gray-50">Profile</Link>
              <Link href="/orders" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2 border-b border-gray-50">My Orders</Link>
          <Link href="/messages" onClick={() => setMobileOpen(false)} className="flex items-center justify-between text-sm font-medium py-2 border-b border-gray-50">
              Messages
              {unreadMessages > 0 && <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{unreadMessages}</span>}
            </Link>
              <button onClick={handleLogout} className="block w-full text-left text-sm font-medium py-2 text-red-500">Logout</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2">Login</Link>
          )}
        </div>
      )}

      {/* NOTIFICATION TOAST */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 z-[9999] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 w-80"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                toast.type === "order" ? "bg-black" : "bg-blue-500"
              }`}>
                {toast.type === "order"
                  ? <FiPackage className="text-white text-base" />
                  : <FiMessageSquare className="text-white text-base" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">
                  {toast.type === "order" ? "Order Update" : "New Message"}
                </p>
                <p className="text-sm font-bold text-gray-800 mt-0.5">{toast.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{toast.message}</p>
              </div>
              <button onClick={() => setToast(null)} className="text-gray-300 hover:text-gray-600 transition shrink-0">
                <FiX className="text-sm" />
              </button>
            </div>
            <Link
              href={toast.type === "order" ? "/orders" : "/messages"}
              onClick={() => setToast(null)}
              className="mt-3 block w-full bg-gray-900 hover:bg-black text-white text-xs font-bold py-2 rounded-xl transition text-center"
            >
              {toast.type === "order" ? "View My Orders" : "View Messages"}
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
