"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiShoppingBag, FiTrash2, FiArrowLeft, FiEdit2, FiCheck, FiX, FiSearch, FiUser, FiShoppingCart } from "react-icons/fi";
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
    <div className="min-h-screen bg-[#faf7f4]">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
        <Link href="/" className="text-3xl font-serif italic text-[#2c2c2c]">Chay Fashion</Link>
        <ul className="flex gap-8 text-sm font-medium items-center">
          <li>
            <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-full px-3 py-1.5 gap-2 hover:border-gray-500 transition">
              <FiSearch className="text-gray-400 text-sm shrink-0" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="text-xs outline-none bg-transparent w-36 placeholder-gray-400" />
            </form>
          </li>
          <li><Link href="/">HOME</Link></li>
          <li><Link href="/about">ABOUT</Link></li>
          <li>
            <Link href="/cart" className="relative flex items-center hover:opacity-70 transition">
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

      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* HEADER */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.4em] text-[#b5a99f] uppercase mb-1">Your Selection</p>
            <h1 className="text-4xl font-bold tracking-tight text-[#2c2c2c]">Shopping Cart</h1>
          </div>
          {cart.length > 0 && (
            <span className="text-sm text-[#9a8c82]">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {cart.length === 0 ? (

          /* EMPTY STATE */
          <div className="bg-white border border-[#e8e0d8] rounded-3xl flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-20 h-20 rounded-full bg-[#f5ede6] flex items-center justify-center">
              <FiShoppingBag className="text-3xl text-[#c9a98a]" />
            </div>
            <div className="text-center">
              <p className="text-[#2c2c2c] font-semibold text-lg">Your cart is empty</p>
              <p className="text-[#9a8c82] text-sm mt-1">Looks like you haven't added anything yet.</p>
            </div>
            <Link
              href="/"
              className="mt-2 bg-[#c9a98a] text-white text-xs px-10 py-3 tracking-[0.3em] uppercase hover:bg-[#b8957a] transition rounded-full"
            >
              Explore Collection
            </Link>
          </div>

        ) : (
          <div className="grid grid-cols-5 gap-8 items-start">

            {/* ITEMS LIST */}
            <div className="col-span-3 space-y-4">
              <AnimatePresence>
              {cart.map((item, index) => {
                const isEditing = editingIndex === index;
                const sizes = getSizes(item.id);
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 30, height: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="group bg-white border border-[#e8e0d8] rounded-2xl overflow-hidden flex hover:shadow-md hover:border-[#c9a98a] transition duration-300"
                  >
                    {/* IMAGE */}
                    <div className="w-32 shrink-0 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover min-h-[148px] group-hover:scale-105 transition duration-500"
                      />
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1 px-5 py-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] tracking-[0.3em] text-[#c9a98a] uppercase font-medium">{item.category}</span>
                        <p className="text-sm font-semibold mt-0.5 text-[#2c2c2c]">{item.name}</p>

                        {isEditing ? (
                          <div className="mt-3">
                            <p className="text-[10px] tracking-widest text-[#9a8c82] uppercase mb-2">Change Size</p>
                            <div className="flex gap-2 flex-wrap">
                              {sizes.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setEditSize(s)}
                                  className={`w-9 h-9 text-xs font-medium border rounded transition ${
                                    editSize === s
                                      ? "bg-[#c9a98a] text-white border-[#c9a98a]"
                                      : "bg-white text-[#2c2c2c] border-[#e8e0d8] hover:border-[#c9a98a] hover:text-[#c9a98a]"
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] tracking-widest text-[#9a8c82] uppercase">Size</span>
                            <span className="text-xs font-bold bg-[#f5ede6] text-[#c9a98a] px-2 py-0.5 rounded">{item.size}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-base font-bold text-[#2c2c2c] mt-3">₱{item.price.toLocaleString()}</p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col justify-between items-end px-4 py-4">
                      <button
                        onClick={() => handleRemove(index)}
                        className="text-[#d4b8ae] hover:text-red-400 transition"
                        title="Remove"
                      >
                        <FiX className="text-lg" />
                      </button>

                      {isEditing ? (
                        <button
                          onClick={() => handleSave(index)}
                          className="flex items-center gap-1 text-xs text-white bg-[#c9a98a] hover:bg-[#b8957a] transition px-3 py-1.5 rounded-full"
                        >
                          <FiCheck /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(index)}
                          className="flex items-center gap-1 text-xs text-[#9a8c82] hover:text-[#c9a98a] transition border border-[#e8e0d8] hover:border-[#c9a98a] px-3 py-1.5 rounded-full"
                        >
                          <FiEdit2 /> Edit
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
              </AnimatePresence>
            </div>

            {/* ORDER SUMMARY */}
            <div className="col-span-2 bg-white border border-[#e8e0d8] rounded-2xl p-7 sticky top-6">

              <p className="text-[10px] tracking-[0.4em] uppercase text-[#b5a99f] mb-6">Order Summary</p>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-[#9a8c82]">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#9a8c82]">
                  <span>Shipping</span>
                  <span>₱{shipping.toLocaleString()}</span>
                </div>
              </div>

              <div className="my-5 border-t border-[#e8e0d8]" />

              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#2c2c2c]">Total</span>
                <span className="text-xl font-bold text-[#2c2c2c]">₱{total.toLocaleString()}</span>
              </div>

              <Link href="/order-confirmation" className="ripple-btn mt-8 block w-full bg-[#c9a98a] text-white py-4 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#b8957a] transition rounded-xl text-center">
                Proceed to Checkout
              </Link>

              <Link
                href="/"
                className="block text-center mt-4 text-xs text-[#b5a99f] hover:text-[#c9a98a] transition tracking-widest uppercase"
              >
                Continue Shopping
              </Link>

              <div className="mt-8 pt-5 border-t border-[#f0e8e0] flex items-center gap-3">
                <div className="h-px flex-1 bg-[#f0e8e0]" />
                <span className="text-[10px] tracking-widest text-[#c9b8ae] uppercase font-serif italic">Chay Fashion</span>
                <div className="h-px flex-1 bg-[#f0e8e0]" />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
