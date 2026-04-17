"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiShoppingBag, FiEdit2, FiCheck, FiX, FiSearch, FiUser, FiShoppingCart, FiArrowRight, FiTag } from "react-icons/fi";
import Link from "next/link";
import { getCart, removeFromCart, updateCartItem, CartItem } from "@/lib/cart";
import { products } from "@/lib/products";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editSize, setEditSize] = useState<string>("");
  const [search, setSearch] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTimeout(() => router.push("/login"), 0); return; }
    };
    check();
    setCart(getCart());
    supabase.auth.getSession().then(({ data: { session } }) => {
      supabase.from("profiles").select("username").eq("id", session?.user?.id ?? "").single()
        .then(({ data }) => setUsername(data?.username ?? session?.user?.email ?? null));
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemove = (index: number) => {
    removeFromCart(index);
    setCart(getCart());
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditSize(cart[index].size);
  };

  const handleSave = (index: number) => {
    updateCartItem(index, { size: editSize });
    setCart(getCart());
    setEditingIndex(null);
  };

  const getSizes = (itemId: number) => products.find((p) => p.id === itemId)?.sizes ?? [];
  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const shipping = cart.length > 0 ? 150 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white border-b border-gray-100">
        <Link href="/" className="text-3xl font-serif italic">Chay Fashion</Link>
        <ul className="flex gap-8 text-sm font-medium items-center">
          <li>
            <form onSubmit={handleSearch} className="flex items-center border border-gray-200 rounded-full px-3 py-1.5 gap-2 hover:border-gray-400 transition">
              <FiSearch className="text-gray-400 text-sm shrink-0" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="text-xs outline-none bg-transparent w-36 placeholder-gray-400" />
            </form>
          </li>
          <li><Link href="/" className="hover:text-gray-500 transition">HOME</Link></li>
          <li><Link href="/about" className="hover:text-gray-500 transition">ABOUT</Link></li>
          <li>
            <Link href="/cart" className="relative flex items-center">
              <FiShoppingCart className="text-xl" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length > 9 ? "9+" : cart.length}
                </span>
              )}
            </Link>
          </li>
          <li className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                <FiUser className="text-white text-lg" />
              </div>
              {username && <span className="text-sm font-medium">{username}</span>}
            </button>
            {dropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-[999] overflow-hidden">
                <Link href="/profile" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">Logout</button>
              </div>
            )}
          </li>
        </ul>
      </nav>

      {cart.length === 0 ? (

        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <FiShoppingBag className="text-5xl text-gray-300" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">0</span>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
            <p className="text-gray-400 text-sm mt-2">Discover our latest collection and add your favorites.</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            <Link href="/shop" className="flex items-center gap-2 bg-black text-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-gray-800 transition">
              Browse Collection <FiArrowRight />
            </Link>
          </motion.div>
        </div>

      ) : (

        /* SPLIT LAYOUT */
        <div className="flex min-h-[calc(100vh-73px)]">

          {/* LEFT — ITEMS */}
          <div className="flex-1 px-12 py-10 overflow-y-auto border-r border-gray-100">

            {/* HEADER */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">Shopping Cart</h1>
                <p className="text-gray-400 text-sm mt-0.5">{cart.length} item{cart.length !== 1 ? "s" : ""} in your bag</p>
              </div>
              <Link href="/shop" className="text-xs text-gray-400 hover:text-black transition underline underline-offset-2">
                Continue Shopping
              </Link>
            </div>

            {/* DIVIDER */}
            <div className="grid grid-cols-4 text-[10px] tracking-widest uppercase text-gray-400 pb-3 border-b border-gray-100 mb-4">
              <span className="col-span-2">Product</span>
              <span className="text-center">Size</span>
              <span className="text-right">Price</span>
            </div>

            {/* CART ITEMS */}
            <AnimatePresence>
              {cart.map((item, index) => {
                const isEditing = editingIndex === index;
                const sizes = getSizes(item.id);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group grid grid-cols-4 items-center gap-4 py-5 border-b border-gray-50 hover:bg-gray-50/50 transition rounded-xl px-2"
                  >
                    {/* PRODUCT */}
                    <div className="col-span-2 flex items-center gap-4">
                      <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                        <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                        <button
                          onClick={() => handleRemove(index)}
                          className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-50"
                        >
                          <FiX className="text-red-400 text-xs" />
                        </button>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] tracking-widest text-gray-400 uppercase">{item.category}</span>
                        <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{item.name}</p>
                      </div>
                    </div>

                    {/* SIZE */}
                    <div className="text-center">
                      {isEditing ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex gap-1 flex-wrap justify-center">
                            {sizes.map((s) => (
                              <button
                                key={s}
                                onClick={() => setEditSize(s)}
                                className={`w-8 h-8 text-[10px] font-bold border transition rounded ${
                                  editSize === s ? "bg-black text-white border-black" : "border-gray-200 hover:border-black"
                                }`}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                          <button onClick={() => handleSave(index)} className="flex items-center gap-1 text-[10px] text-green-600 font-semibold hover:text-green-700 transition">
                            <FiCheck /> Save
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(index)}
                          className="inline-flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium hover:border-black transition"
                        >
                          {item.size} <FiEdit2 className="text-[10px] text-gray-400" />
                        </button>
                      )}
                    </div>

                    {/* PRICE */}
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800">₱{item.price.toLocaleString()}</p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="w-96 shrink-0 bg-[#faf9f7] px-10 py-10 flex flex-col">

            <h2 className="text-lg font-bold mb-8">Order Summary</h2>

            {/* ITEM PREVIEWS */}
            <div className="flex gap-2 mb-8 flex-wrap">
              {cart.slice(0, 4).map((item, i) => (
                <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ))}
              {cart.length > 4 && (
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                  +{cart.length - 4}
                </div>
              )}
            </div>

            {/* PRICE BREAKDOWN */}
            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({cart.length} items)</span>
                <span>₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>₱{shipping.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-gray-800">₱{total.toLocaleString()}</span>
              </div>
            </div>

            {/* PROMO CODE */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
                <FiTag className="text-gray-400 text-sm shrink-0" />
                <input type="text" placeholder="Promo code" className="text-xs outline-none bg-transparent flex-1 placeholder-gray-400" />
              </div>
              <button className="bg-black text-white text-xs px-4 rounded-xl font-semibold hover:bg-gray-800 transition">Apply</button>
            </div>

            {/* CHECKOUT */}
            <Link
              href="/order-confirmation"
              className="w-full bg-black text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition flex items-center justify-center gap-3 rounded-xl"
            >
              Proceed to Checkout <FiArrowRight />
            </Link>

            {/* TRUST BADGES */}
            <div className="mt-8 pt-6 border-t border-gray-200 grid grid-cols-3 gap-3 text-center">
              {[
                { icon: "🔒", label: "Secure Payment" },
                { icon: "🚚", label: "Fast Delivery" },
                { icon: "↩️", label: "Easy Returns" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1">
                  <span className="text-lg">{b.icon}</span>
                  <span className="text-[10px] text-gray-400 leading-tight">{b.label}</span>
                </div>
              ))}
            </div>

            <div className="mt-auto pt-8 text-center">
              <p className="text-[10px] tracking-widest text-gray-300 uppercase font-serif italic">Chay Fashion</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
