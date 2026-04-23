"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiSearch, FiUser, FiShoppingCart, FiArrowLeft } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { products } from "@/lib/products";
import { getCart, addToCart } from "@/lib/cart";
import { motion } from "framer-motion";
import { ProductSkeleton } from "@/components/LoadingStates";

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const query = searchParams.get("q") ?? "";

  const [search, setSearch] = useState(query);
  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [dropdown, setDropdown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(8);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const filtered = query.trim()
    ? products.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.category.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
      )
    : [];

  const visibleFiltered = filtered.slice(0, visibleCount);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null;
      if (user) {
        supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
          .then(({ data }) => setUsername(data?.username ?? user.email ?? null));
        setUserId(user.id);
        setCartCount(getCart(user.id).length);
      }
      setLoaded(true);
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsername(null);
    router.push("/");
  };

  const handleAddToCart = (e: React.MouseEvent, item: typeof products[0]) => {
    e.preventDefault();
    e.stopPropagation();
    if (!username) { router.push("/login"); return; }
    addToCart({ id: item.id, name: item.name, img: item.img, price: item.price, size: item.sizes[0], category: item.category }, userId ?? undefined);
    setCartCount(getCart(userId ?? undefined).length);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#faf9f7]">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
        <Link href="/" className="text-3xl font-serif italic">Chay Fashion</Link>
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
              {cartCount > 0 && (
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

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-10 py-12">

        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-400 hover:text-black mb-8 transition">
          <FiArrowLeft /> Back
        </button>

        <div className="mb-10">
          <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Search</span>
          <h1 className="text-3xl font-bold mt-1">
            {query ? `Results for "${query}"` : "Search Products"}
          </h1>
          {query && (
            <p className="text-gray-400 text-sm mt-2">
              {filtered.length} {filtered.length === 1 ? "product" : "products"} found
            </p>
          )}
        </div>

        {!query ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FiSearch className="text-5xl text-gray-200" />
            <p className="text-gray-400 text-sm">Type something in the search bar above.</p>
          </div>
        ) : !loaded ? (
          <ProductSkeleton count={4} />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <FiSearch className="text-5xl text-gray-200" />
            <p className="text-xl font-bold text-gray-700">No results found</p>
            <p className="text-gray-400 text-sm">Try searching for "dress", "watch", or "scrub".</p>
            <Link href="/" className="mt-4 bg-black text-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-gray-800 transition rounded-xl">
              Browse All Products
            </Link>
          </div>
        ) : (
          <>
          <div className="grid grid-cols-4 gap-5">
            {visibleFiltered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
              >
                <Link href={`/product/${item.id}`}>
                  <div className="group bg-white shadow-sm hover:shadow-lg transition duration-300 overflow-hidden cursor-pointer">
                    <div className="overflow-hidden">
                      <img src={item.img} alt={item.name} className="w-full h-[260px] object-cover transition-transform duration-700 group-hover:scale-110" />
                    </div>
                    <div className="p-4 border-t border-gray-100">
                      <p className="text-[10px] tracking-widest text-gray-400 uppercase">{item.category}</p>
                      <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{item.name}</p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-bold text-[#c9a98a]">₱{item.price.toLocaleString()}</p>
                        <button
                          onClick={(e) => handleAddToCart(e, item)}
                          className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                            addedId === item.id ? "bg-green-500 text-white" : "bg-black text-white hover:bg-gray-700"
                          }`}
                        >
                          {addedId === item.id ? <span className="text-xs font-bold">✓</span> : <FiShoppingCart className="text-xs" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
          {visibleCount < filtered.length && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisibleCount(v => v + 8)}
                className="px-10 py-3 border-2 border-black text-sm font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition"
              >
                Load More ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense>
      <SearchResults />
    </Suspense>
  );
}
