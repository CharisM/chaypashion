"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiSearch, FiUser, FiShoppingCart, FiFacebook, FiMapPin, FiPhone, FiMail, FiShoppingBag } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { products } from "@/lib/products";
import { getCart, addToCart } from "@/lib/cart";
import { getStockMap, deductStock, StockMap } from "@/lib/stock";
import { motion, AnimatePresence } from "framer-motion";

export default function ShopPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [stockMap, setStockMap] = useState<StockMap>({});
  const dropdownRef = useRef<HTMLLIElement>(null);

  const filteredProducts = filter === "All"
    ? products
    : products.filter(p => p.category === filter);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const handleAddToCart = async (item: typeof products[0]) => {
    if (!username) { router.push("/login"); return; }
    if ((stockMap[item.id] ?? 0) <= 0) return;
    addToCart({ id: item.id, name: item.name, img: item.img, price: item.price, size: item.sizes[0], category: item.category }, userId ?? undefined);
    await deductStock(item.id, 1);
    setStockMap(prev => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] ?? 0) - 1) }));
    setCartCount(getCart(userId ?? undefined).length);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsername(null);
    setDropdown(false);
    router.push("/");
  };

  useEffect(() => {
    const getUser = async (user: any) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        setUsername(data?.username ?? user.email ?? null);
        setUserId(user.id);
      } else {
        setUsername(null);
      }
      setLoaded(true);
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) { supabase.auth.signOut(); setLoaded(true); return; }
      getUser(session?.user ?? null);
    });
    getStockMap().then(setStockMap);

    const stockChannel = supabase
      .channel("shop-stock")
      .on("postgres_changes", { event: "*", schema: "public", table: "stock" }, (payload: any) => {
        const { product_id, quantity } = payload.new;
        setStockMap(prev => ({ ...prev, [product_id]: quantity }));
      })
      .subscribe();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") getUser(session?.user ?? null);
      else if (event === "SIGNED_OUT") { setUsername(null); setLoaded(true); }
    });

    return () => { subscription.unsubscribe(); supabase.removeChannel(stockChannel); };
  }, []);

  useEffect(() => { setCartCount(getCart(userId ?? undefined).length); }, [loaded, userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
        <Link href="/"><h1 className="text-3xl font-serif italic">Chay Fashion</h1></Link>
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
              {loaded && username && cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount > 9 ? "9+" : cartCount}
                </span>
              )}
            </Link>
          </li>
          <li className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                <FiUser className="text-white text-lg" />
              </div>
              {loaded && username && <span className="text-sm font-medium">{username}</span>}
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
          </li>
        </ul>
      </nav>

      {/* HERO BANNER */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center animate-kenburns" style={{ backgroundImage: "url('/BG.jpg')" }} />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative h-full flex flex-col items-center justify-center text-center">
          <motion.span initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Our Collection</motion.span>
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="text-white text-4xl font-bold mt-2">All Products</motion.h1>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="max-w-6xl mx-auto px-6 py-14">

        {/* HEADER + FILTERS */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Collection</span>
            <h2 className="text-3xl font-bold tracking-tight mt-1">New Arrivals</h2>
            <p className="text-gray-400 text-sm mt-1">Fresh styles just dropped — explore the latest.</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {["All", "Dress", "Watch", "Herborist Scrub"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-5 py-2 text-xs font-semibold tracking-widest uppercase border transition ${
                  filter === cat
                    ? "bg-black text-white border-black"
                    : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
                }`}
              >
                {cat === "Herborist Scrub" ? "Body Essentials" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* ITEM COUNT */}
        <div className="flex items-center gap-3 mb-8">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-xs text-gray-400 tracking-widest uppercase">{filteredProducts.length} items</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* GRID */}
        <AnimatePresence mode="wait">
          <div className="grid grid-cols-4 gap-5">
            {filteredProducts.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
              >
                <div className="group relative overflow-hidden bg-white cursor-pointer shadow-sm hover:shadow-lg transition duration-300">
                  <Link href={`/product/${item.id}`}>
                    <div className="overflow-hidden relative">
                      <img src={item.img} alt={item.name} className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-110" />
                      {(stockMap[item.id] ?? 1) === 0 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Out of Stock</span>
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300" />
                  </Link>
                  <div className="p-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-sm font-bold text-[#c9a98a] mt-1">₱{item.price.toLocaleString()}</p>
                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={(stockMap[item.id] ?? 1) === 0}
                      className={`mt-3 w-full py-2 text-xs font-bold tracking-widest uppercase transition rounded-lg flex items-center justify-center gap-2 ${
                        (stockMap[item.id] ?? 1) === 0
                          ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                          : addedId === item.id
                          ? "bg-green-500 text-white"
                          : "bg-black text-white hover:bg-gray-800"
                      }`}
                    >
                      <FiShoppingBag className="text-sm" />
                      {(stockMap[item.id] ?? 1) === 0 ? "Out of Stock" : addedId === item.id ? "Added!" : "Add to Cart"}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 pt-16 pb-8 px-16">
        <div className="grid grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          <div className="col-span-1">
            <h2 className="text-white text-2xl font-serif italic mb-4">Chay Fashion</h2>
            <p className="text-sm leading-relaxed text-gray-500">Modern styles for everyday wear. Quality fashion made accessible for everyone.</p>
          </div>
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Categories</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/shop" className="hover:text-white transition">Dress</Link></li>
              <li><Link href="/shop" className="hover:text-white transition">Watch</Link></li>
              <li><Link href="/shop" className="hover:text-white transition">Herborist Scrub</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Account</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/profile" className="hover:text-white transition">My Profile</Link></li>
              <li><Link href="/cart" className="hover:text-white transition">My Cart</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">More</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2"><FiMapPin className="shrink-0 text-base" /> Philippines</li>
              <li className="flex items-center gap-2"><FiPhone className="shrink-0 text-base" /> 09123456789</li>
              <li className="flex items-center gap-2"><FiMail className="shrink-0 text-base" /> support@chayfashion.com</li>
            </ul>
          </div>
        </div>
        <div className="pt-6 flex justify-between items-center text-xs text-gray-600">
          <p>© 2026 Chay Fashion. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="https://www.facebook.com/profile.php?id=61578244202994" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-white hover:text-blue-400 transition">
              <FiFacebook className="text-lg" />
              <span className="text-sm font-medium">Chay Pasion</span>
            </a>
            <span className="text-gray-600">|</span>
            <Link href="/privacy-policy" className="text-gray-300 hover:text-white transition">Privacy Policy</Link>
            <span className="text-gray-600">|</span>
            <Link href="/terms-of-service" className="text-gray-300 hover:text-white transition">Terms of Service</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
