"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FiSearch, FiUser, FiFacebook, FiShoppingCart, FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { products } from "@/lib/products";
import { motion, AnimatePresence } from "framer-motion";
import { getCart } from "@/lib/cart";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const filteredProducts = filter === "All"
    ? products
    : products.filter(p => p.category === filter);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  useEffect(() => {
    const getUser = async (user: any) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        setUsername(data?.username ?? user.email ?? null);
      } else {
        setUsername(null);
      }
      setLoaded(true);
    };

    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        supabase.auth.signOut();
        setLoaded(true);
        return;
      }
      getUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") {
        getUser(session?.user ?? null);
      } else if (event === "SIGNED_OUT") {
        setUsername(null);
        setLoaded(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setCartCount(getCart().length);
  }, [loaded]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsername(null);
    setDropdown(false);
    router.push("/");
  };

  return (
    <div className="w-full">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white">
        <Link href="/"><h1 className="text-3xl font-serif italic">Chay Fashion</h1></Link>

        <ul className="flex gap-8 text-sm font-medium items-center">
          <li>
            <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-full px-3 py-1.5 gap-2 hover:border-gray-500 transition">
              <FiSearch className="text-gray-400 text-sm shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products..."
                className="text-xs outline-none bg-transparent w-36 placeholder-gray-400"
              />
            </form>
          </li>
          <li className="text-blue-600"><Link href="/">HOME</Link></li>
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
            <button
              onClick={() => setDropdown(!dropdown)}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
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

      {/* HERO */}
    <div className="h-[70vh] relative overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center animate-kenburns"
        style={{ backgroundImage: "url('/BG.jpg')" }}
      />
      <div className="absolute inset-0 bg-black/10"></div>
      <div className="relative flex items-center h-full px-16">
        <div className="text-white max-w-xl">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-5xl font-bold leading-tight drop-shadow-lg"
          >
            STYLIST PICKS BEAT
            <br />
            THE HEAT
          </motion.h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.3 }}>
            {loaded && !username ? (
              <Link href="/login">
                <button className="mt-8 border-2 border-white px-6 py-2 hover:bg-white hover:text-black transition">
                  SHOP NOW
                </button>
              </Link>
            ) : (
              <Link href="/shop">
                <button className="mt-8 border-2 border-white px-6 py-2 hover:bg-white hover:text-black transition">
                  SHOP NOW
                </button>
              </Link>
            )}
          </motion.div>
        </div>
      </div>
    </div>
      {/* PRODUCTS */}
      <div id="new-arrivals" className="bg-[#faf9f7] py-24 px-10">

        {/* SECTION HEADER */}
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Collection</span>
              <h2 className="text-4xl font-bold tracking-tight mt-1">New Arrivals</h2>
              <p className="text-gray-400 text-sm mt-2">Fresh styles just dropped — explore the latest.</p>
            </div>

            {/* FILTER TABS */}
            <div className="flex gap-2">
              {["All", "Dress", "Watch", "Herborist Scrub"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat === "Herborist Scrub" ? "Herborist Scrub" : cat)}
                  className={`px-5 py-2 text-xs font-semibold tracking-widest uppercase border transition ${
                    filter === cat || (cat === "All" && filter === "All")
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-500 border-gray-200 hover:border-black hover:text-black"
                  }`}
                >
                  {cat === "Herborist Scrub" ? "Body Essentials" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* PRODUCT COUNT */}
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
                  <Link href={loaded && !username ? "/login" : `/product/${item.id}`}>
                    <div className="group relative overflow-hidden bg-white cursor-pointer shadow-sm hover:shadow-lg transition duration-300">
                      <div className="overflow-hidden">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      {/* OVERLAY */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300" />
                      {/* VIEW BUTTON */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                        <span className="bg-white text-black text-xs font-bold px-6 py-2.5 tracking-[0.2em] uppercase shadow-md">
                          View Item
                        </span>
                      </div>
                      {/* CATEGORY TAG */}
                      <div className="absolute top-3 left-3 bg-white/90 text-[10px] tracking-widest uppercase px-2 py-1 font-semibold text-gray-600">
                        {item.category}
                      </div>
                      {/* BOTTOM INFO */}
                      <div className="p-4 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                        <p className="text-sm font-bold text-[#c9a98a] mt-1">₱{item.price.toLocaleString()}</p>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <div className="bg-white py-20 px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs tracking-[0.3em] text-gray-400 uppercase">Our Promise</span>
            <h2 className="text-3xl font-bold mt-2 mb-6">Quality You Can Trust</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              At Chay Fashion, we curate only the finest pieces — from elegant dresses to authentic Fossil watches and premium Herborist skincare. Every product is handpicked to ensure quality, style, and value.
            </p>
            <p className="text-gray-600 leading-relaxed mb-6">
              Whether you're dressing up for a special occasion or treating yourself to luxury accessories, we're here to make fashion accessible and enjoyable for everyone.
            </p>
            <Link href="/about">
              <button className="bg-black text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-gray-800 transition">
                Learn More
              </button>
            </Link>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-4"
          >
            <img src="/D1.jpg" alt="Fashion" className="w-full h-48 object-cover rounded-lg" />
            <img src="/WD1.jpg" alt="Watch" className="w-full h-48 object-cover rounded-lg" />
            <img src="/SCRUB1.jpg" alt="Scrub" className="w-full h-48 object-cover rounded-lg" />
            <img src="/D3.jpg" alt="Dress" className="w-full h-48 object-cover rounded-lg" />
          </motion.div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <div className="bg-gray-50 py-20 px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.3em] text-gray-400 uppercase">Customer Love</span>
            <h2 className="text-3xl font-bold mt-2">What Our Customers Say</h2>
          </div>
          <div className="grid grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
              </div>
              <p className="text-sm text-gray-600 mb-4 italic">
                "The dresses are absolutely beautiful! Great quality and fast shipping. Will definitely order again."
              </p>
              <p className="text-xs font-semibold">— Maria Santos</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
              </div>
              <p className="text-sm text-gray-600 mb-4 italic">
                "Bought a Fossil watch and it's authentic! Love the packaging and customer service was excellent."
              </p>
              <p className="text-xs font-semibold">— John Reyes</p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white p-6 rounded-xl shadow-sm"
            >
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => <span key={i} className="text-yellow-400">★</span>)}
              </div>
              <p className="text-sm text-gray-600 mb-4 italic">
                "The Herborist scrubs are amazing! My skin feels so smooth and refreshed. Highly recommend!"
              </p>
              <p className="text-xs font-semibold">— Ana Cruz</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 pt-16 pb-8 px-16">
        <div className="grid grid-cols-5 gap-10 pb-12 border-b border-gray-800">

          {/* BRAND */}
          <div className="col-span-1">
            <h2 className="text-white text-2xl font-serif italic mb-4">Chay Fashion</h2>
            <p className="text-sm leading-relaxed text-gray-500">
              Modern styles for everyday wear. Quality fashion made accessible for everyone.
            </p>
          </div>

          {/* QUICK LINKS */}
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About</Link></li>
            </ul>
          </div>

          {/* CATEGORIES */}
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Categories</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-white transition">Dress</Link></li>
              <li><Link href="/" className="hover:text-white transition">Watch</Link></li>
              <li><Link href="/" className="hover:text-white transition">Herborist Scrub</Link></li>
            </ul>
          </div>

          {/* ACCOUNT */}
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Account</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/profile" className="hover:text-white transition">My Profile</Link></li>
              <li><Link href="/cart" className="hover:text-white transition">My Cart</Link></li>
              <li><Link href="/login" className="hover:text-white transition">Login</Link></li>
            </ul>
          </div>

          {/* MORE */}
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">More</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li className="flex items-center gap-2"><FiMapPin className="shrink-0 text-base" /> Philippines</li>
              <li className="flex items-center gap-2"><FiPhone className="shrink-0 text-base" /> 09123456789</li>
              <li className="flex items-center gap-2"><FiMail className="shrink-0 text-base" /> support@chayfashion.com</li>
            </ul>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="pt-6 flex justify-between items-center text-xs text-gray-600">
          <p>© 2026 Chay Fashion. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a
              href="https://www.facebook.com/profile.php?id=61578244202994"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-white hover:text-blue-400 transition animate-bounce-fb"
            >
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