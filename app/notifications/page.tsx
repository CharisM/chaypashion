"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiBell, FiPackage, FiMessageSquare, FiCheck } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { getNotifications, markAllRead, markOneRead, subscribeNotifications, Notification } from "@/lib/notifications";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTimeout(() => router.push("/login"), 0); return; }
      if (user.email === "chayfashion.admin@gmail.com") { router.replace("/admin"); return; }
      setUserId(user.id);
      const data = await getNotifications(user.id);
      setNotifications(data);
      setLoading(false);

      const unsub = subscribeNotifications(user.id, (n) =>
        setNotifications(prev => [n, ...prev])
      );
      return unsub;
    };
    load();
  }, []);

  const handleMarkAllRead = async () => {
    if (!userId) return;
    await markAllRead(userId);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleMarkOne = async (id: string) => {
    await markOneRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const getIcon = (type: Notification["type"]) =>
    type === "order"
      ? <FiPackage className="text-sm" />
      : <FiMessageSquare className="text-sm" />;

  const getIconBg = (type: Notification["type"], read: boolean) =>
    read
      ? "bg-gray-100 text-gray-400"
      : type === "order"
        ? "bg-black text-white"
        : "bg-blue-500 text-white";

  const getLink = (n: Notification) =>
    n.type === "order" ? "/orders" : "/messages";

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-medium mb-1">Updates</p>
            <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-black border border-gray-200 hover:border-black px-4 py-2 rounded-xl transition"
            >
              <FiCheck className="text-sm" /> Mark all as read
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <FiBell className="text-4xl text-gray-300" />
            </div>
            <p className="text-gray-800 font-semibold">No notifications yet</p>
            <p className="text-gray-400 text-sm">You'll be notified about order updates and messages here.</p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map((n, i) => (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Link
                    href={getLink(n)}
                    onClick={() => !n.read && handleMarkOne(n.id)}
                    className={`flex items-start gap-4 px-5 py-4 rounded-2xl border transition hover:border-gray-300 hover:shadow-sm ${
                      !n.read ? "bg-white border-gray-200" : "bg-white/60 border-gray-100"
                    }`}
                  >
                    {/* ICON */}
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${getIconBg(n.type, n.read)}`}>
                      {getIcon(n.type)}
                    </div>

                    {/* CONTENT */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={`text-sm font-semibold ${n.read ? "text-gray-500" : "text-gray-900"}`}>
                          {n.title}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0 mt-0.5">
                          {new Date(n.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{n.message}</p>
                    </div>

                    {/* UNREAD DOT */}
                    {!n.read && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                    )}
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
