"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FiSearch, FiUser, FiShoppingCart, FiFacebook, FiHeart, FiTrash2, FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { getWishlist, removeFromWishlist, Product } from "@/lib/wishlist";
import { addToCart, getCart } from "@/lib/cart";
import { motion, AnimatePresence } from "framer-motion";

export default function WishlistPage() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [addedId, setAddedId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(9);
  const visibleWishlist = wishlist.slice(0, visibleCount);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsername(null);
    setDropdown(false);
    router.push("/login");
  };

  const handleRemove = async (id: number) => {
    if (!userId) return;
    const { error } = await removeFromWishlist(userId, id);
    if (error) { alert("Failed to remove item. Please try again."); return; }
    setWishlist(prev => prev.filter(p => p.id !== id));
  };

  const handleAddToCart = (item: Product) => {
    addToCart({ id: item.id, name: item.name, img: item.img, price: item.price, size: item.sizes[0], category: item.category }, userId ?? undefined);
    setCartCount(getCart(userId ?? undefined).length);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  useEffect(() => {
    const getUser = async (user: any) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
        setUsername(data?.username ?? user.email ?? null);
        setUserId(user.id);
        const wl = await getWishlist(user.id);
        setWishlist(wl);
        setCartCount(getCart(user.id).length);
      } else { setUsername(null); }
      setLoaded(true);
    };
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) { supabase.auth.signOut(); setLoaded(true); return; }
      getUser(session?.user ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") getUser(session?.user ?? null);
      else if (event === "SIGNED_OUT") { setUsername(null); setLoaded(true); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setCartCount(getCart(userId ?? undefined).length);
  }, [loaded, userId]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setDropdown(false);
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

      <div className="max-w-5xl mx-auto px-6 py-14">
        {!loaded ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
        <>
        <div className="flex items-center gap-3 mb-10">
          <FiHeart className="text-2xl text-[#c9a98a]" />
          <div>
            <p className="text-xs tracking-[0.4em] text-[#b5a99f] uppercase">Saved Items</p>
            <h1 className="text-3xl font-bold text-gray-800">My Wishlist</h1>
          </div>
          <span className="ml-auto text-sm text-gray-400">{wishlist.length} item{wishlist.length !== 1 ? "s" : ""}</span>
        </div>

        {wishlist.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white border border-[#e8e0d8] rounded-3xl flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-20 h-20 rounded-full bg-[#f5ede6] flex items-center justify-center">
              <FiHeart className="text-3xl text-[#c9a98a]" />
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-semibold text-lg">Your wishlist is empty</p>
              <p className="text-gray-400 text-sm mt-1">Save items you love by clicking the heart icon.</p>
            </div>
            <Link href="/shop" className="mt-2 bg-[#c9a98a] text-white text-xs px-10 py-3 tracking-[0.3em] uppercase hover:bg-[#b8957a] transition rounded-full">
              Browse Collection
            </Link>
          </motion.div>
        ) : (
          <>
          <div className="grid grid-cols-3 gap-6">
            <AnimatePresence>
              {visibleWishlist.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="bg-white border border-[#e8e0d8] rounded-2xl overflow-hidden hover:shadow-md hover:border-[#c9a98a] transition duration-300"
                >
                  <Link href={`/product/${item.id}`}>
                    <div className="overflow-hidden">
                      <img src={item.img} alt={item.name} className="w-full h-52 object-cover hover:scale-105 transition duration-500" />
                    </div>
                  </Link>
                  <div className="p-4">
                    <span className="text-[10px] tracking-widest text-[#c9a98a] uppercase font-medium">{item.category}</span>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{item.name}</p>
                    <p className="text-base font-bold text-gray-800 mt-1">₱{item.price.toLocaleString()}</p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleAddToCart(item)}
                        className={`flex-1 py-2 text-xs font-bold tracking-widest uppercase transition rounded-lg ${addedId === item.id ? "bg-green-500 text-white" : "bg-black text-white hover:bg-gray-800"}`}
                      >
                        {addedId === item.id ? "✓ Added!" : "Add to Cart"}
                      </button>
                      <button onClick={() => handleRemove(item.id)} className="p-2 border border-[#e8e0d8] rounded-lg text-gray-400 hover:text-red-500 hover:border-red-300 transition">
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          {visibleCount < wishlist.length && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisibleCount(v => v + 9)}
                className="px-10 py-3 border-2 border-black text-sm font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition"
              >
                Load More ({wishlist.length - visibleCount} remaining)
              </button>
            </div>
          )}
          </>
        )}
        </>
        )}
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 pt-16 pb-8 px-16">
        <div className="grid grid-cols-5 gap-10 pb-12 border-b border-gray-800">
          <div className="col-span-1">
            <h2 className="text-white text-2xl font-serif italic mb-4">Chay Fashion</h2>
            <p className="text-sm leading-relaxed text-gray-500">Modern styles for everyday wear.</p>
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
              <FiFacebook className="text-lg" /><span className="text-sm font-medium">Chay Pasion</span>
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
