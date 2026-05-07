"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FiMessageSquare, FiSend, FiClock, FiCheckCircle, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { getUserMessages, saveContactMessage, ContactMessage, markUserMessagesRead } from "@/lib/orders";
import Navbar from "@/components/Navbar";
import { motion, AnimatePresence } from "framer-motion";

export default function MessagesPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTimeout(() => router.push("/login"), 0); return; }
      if (user.email === "chayfashion.admin@gmail.com") { router.replace("/admin"); return; }
      setUserId(user.id);
      setUserEmail(user.email ?? "");
      const { data: profile } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
      setUserName(profile?.username ?? user.email ?? "");
      const data = await getUserMessages(user.id);
      setMessages(data);
      if (data.length > 0) setOpenId(data[0].id);
      await markUserMessagesRead(user.id);
      setLoading(false);

      // Real-time: update messages when admin replies
      const channel = supabase
        .channel("user-messages-realtime")
        .on("postgres_changes",
          { event: "UPDATE", schema: "public", table: "contact_messages", filter: `user_id=eq.${user.id}` },
          (payload: { new: any }) => {
            const m = payload.new;
            setMessages(prev => prev.map(x => x.id === m.id ? {
              ...x,
              adminReply: m.admin_reply,
              repliedAt: m.replied_at,
              read: m.read,
            } : x));
            setOpenId(m.id);
          }
        )
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    };
    load();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || !userId) return;
    setSending(true);
    await saveContactMessage(userName, userEmail, text.trim(), userId);
    const updated = await getUserMessages(userId);
    setMessages(updated);
    if (updated.length > 0) setOpenId(updated[0].id);
    setText("");
    setSending(false);
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-medium mb-1">Support</p>
          <h1 className="text-2xl font-bold text-gray-900">My Messages</h1>
        </div>

        {/* COMPOSE BOX */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
            <FiMessageSquare className="text-gray-400 text-sm" />
            <p className="text-xs font-bold tracking-widest uppercase text-gray-600">New Message</p>
          </div>
          <form onSubmit={handleSend} className="px-6 py-4 flex flex-col gap-3">
            <textarea
              rows={3}
              required
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Write your message to Chay Fashion support..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black resize-none transition"
            />
            <div className="flex items-center justify-between">
              {sent && <p className="text-xs text-green-600 font-medium">✓ Message sent!</p>}
              {!sent && <span />}
              <button
                type="submit"
                disabled={sending || !text.trim()}
                className="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-gray-800 transition disabled:opacity-50"
              >
                <FiSend className="text-sm" />
                {sending ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>

        {/* MESSAGES LIST */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <FiMessageSquare className="text-4xl text-gray-300" />
            </div>
            <p className="text-gray-500 text-sm">No messages yet. Send one above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((m, i) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                {/* THREAD HEADER */}
                <button
                  onClick={() => setOpenId(openId === m.id ? null : m.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition text-left"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${m.adminReply ? "bg-green-500" : "bg-yellow-400"}`} />
                    <p className="text-sm font-medium text-gray-800 truncate">{m.message}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <span className={`text-[10px] px-2 py-1 rounded-full font-semibold ${m.adminReply ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"}`}>
                      {m.adminReply ? "Replied" : "Pending"}
                    </span>
                    <span className="text-[10px] text-gray-400">
                      {new Date(m.createdAt).toLocaleDateString("en-PH", { month: "short", day: "numeric" })}
                    </span>
                    {openId === m.id ? <FiChevronUp className="text-gray-400 text-sm" /> : <FiChevronDown className="text-gray-400 text-sm" />}
                  </div>
                </button>

                {/* THREAD BODY */}
                <AnimatePresence>
                  {openId === m.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden border-t border-gray-100"
                    >
                      {/* YOUR MESSAGE */}
                      <div className="px-6 py-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[10px] tracking-widest uppercase text-gray-400 font-medium flex items-center gap-1.5">
                            <FiSend className="text-xs" /> You
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {new Date(m.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.message}</p>
                      </div>

                      {/* ADMIN REPLY */}
                      <div className="px-6 py-4">
                        {m.adminReply ? (
                          <>
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-[10px] tracking-widest uppercase text-green-600 font-medium flex items-center gap-1.5">
                                <FiCheckCircle className="text-xs" /> Chay Fashion
                              </span>
                              {m.repliedAt && (
                                <span className="text-[10px] text-gray-400">
                                  {new Date(m.repliedAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap">{m.adminReply}</p>
                          </>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400 text-xs">
                            <FiClock className="text-sm" />
                            <span>Awaiting reply from support...</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
