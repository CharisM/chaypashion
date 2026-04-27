"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FiSearch, FiFacebook, FiShoppingCart, FiMapPin, FiPhone, FiMail } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useProducts } from "@/lib/use-products";
import { motion, AnimatePresence } from "framer-motion";
import { addToCart } from "@/lib/cart";
import { getStockMap, StockMap } from "@/lib/stock";
import Navbar from "@/components/Navbar";

export default function Home() {
  const router = useRouter();
  const [loaded, setLoaded] = useState(false);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [addedId, setAddedId] = useState<number | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [stockMap, setStockMap] = useState<StockMap>({});
  const [visibleCount, setVisibleCount] = useState(8);
  const [testimonials, setTestimonials] = useState<{ username: string; comment: string; rating: number; productName: string }[]>([]);
  const { products, loading: productsLoading } = useProducts();

  const filteredProducts = (filter === "All" ? products : products.filter(p => p.category === filter))
    .filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  const visibleProducts = filteredProducts.slice(0, visibleCount);

  const handleAddToCart = async (e: React.MouseEvent, item: (typeof products)[number]) => {
    e.preventDefault();
    e.stopPropagation();
    if (!loaded || !username) { router.push("/login"); return; }
    if ((stockMap[item.id] ?? 0) <= 0) return;
    addToCart({ id: item.id, name: item.name, img: item.img, price: item.price, size: item.sizes[0], category: item.category }, userId ?? undefined);
    setAddedId(item.id);
    setTimeout(() => setAddedId(null), 2000);
  };

  useEffect(() => {
    if (products.length === 0) return;

    // fetch top reviews for testimonials
    supabase.from("reviews").select("username, comment, rating, product_id").eq("rating", 5).order("created_at", { ascending: false }).limit(3)
      .then(({ data }) => {
        if (data) setTestimonials(data.map(r => ({
          username: r.username,
          comment: r.comment,
          rating: r.rating,
          productName: products.find(p => p.id === r.product_id)?.name ?? "",
        })));
      });
  }, [products]);

  useEffect(() => {
    const getUser = async (user: any) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
        setUsername(data?.username ?? user.email ?? null);
        setUserId(user.id);
      } else { setUsername(null); }
      setLoaded(true);
    };
    supabase.auth.getSession().then(({ data: { session } }) => getUser(session?.user ?? null));
    getStockMap().then(setStockMap);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") getUser(session?.user ?? null);
      else if (event === "SIGNED_OUT") { setUsername(null); setUserId(null); setLoaded(true); }
    });
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="w-full">

      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <div className="h-screen relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center animate-kenburns"
          style={{ backgroundImage: "url('/BG.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/35 to-transparent" />
        <div className="relative flex flex-col justify-center h-full px-10 md:px-24">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="text-white text-5xl md:text-7xl font-extrabold leading-[1.05] tracking-tight max-w-2xl"
          >
            STYLIST PICKS
            <br />
            <span className="text-[#c9a98a] italic font-bold">BEAT THE HEAT.</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="text-gray-300 text-sm md:text-base mt-5 max-w-sm leading-relaxed tracking-wide"
          >
            Curated fashion, premium watches &amp; luxury skincare — all in one place.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8"
          >
            <Link href={loaded && !username ? "/login" : "/shop"}>
              <button className="bg-[#c9a98a] text-white px-10 py-3 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#b8956f] transition shadow-lg">
                SHOP NOW
              </button>
            </Link>
          </motion.div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="text-white/40 text-[10px] tracking-[0.4em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-white/25 animate-pulse" />
        </div>
      </div>

      {/* CATEGORY STRIP */}
      <div className="bg-black text-white py-5 px-10">
        <div className="max-w-6xl mx-auto flex flex-wrap justify-center gap-12">
          {[
            { label: "Dresses", cat: "Dress" },
            { label: "Watches", cat: "Watch" },
            { label: "Body Essentials", cat: "Herborist Scrub" },
          ].map(({ label, cat }) => (
            <button
              key={cat}
              onClick={() => { setFilter(cat); document.getElementById("new-arrivals")?.scrollIntoView({ behavior: "smooth" }); }}
              className="text-xs tracking-[0.4em] uppercase font-medium text-gray-400 hover:text-[#c9a98a] transition border-b border-transparent hover:border-[#c9a98a] pb-1"
            >
              {label}
            </button>
          ))}
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
                  onClick={() => { setFilter(cat === "Herborist Scrub" ? "Herborist Scrub" : cat); setVisibleCount(8); }}
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

          {/* SEARCH BAR */}
          <div className="mb-6">
            <div className="flex items-center border border-gray-300 rounded-full px-5 py-3 gap-3 max-w-xl mx-auto hover:border-gray-500 transition bg-white shadow-sm">
              <FiSearch className="text-gray-400 text-lg shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setVisibleCount(8); }}
                placeholder="Search products..."
                className="outline-none bg-transparent flex-1 text-sm placeholder-gray-400"
              />
              {search && (
                <button onClick={() => { setSearch(""); setVisibleCount(8); }} className="text-gray-400 hover:text-black transition text-xs">✕</button>
              )}
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
            {!loaded || productsLoading ? (
              <div className="grid grid-cols-4 gap-5">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white h-[360px] animate-pulse rounded-sm" />
                ))}
              </div>
            ) : (
            <div className="grid grid-cols-4 gap-5">
              {visibleProducts.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, delay: i * 0.04 }}
                >
                  <Link href={loaded && !username ? "/login" : `/product/${item.id}`}>
                    <div className="group relative overflow-hidden bg-white cursor-pointer shadow-sm hover:shadow-lg transition duration-300">
                      <div className="overflow-hidden relative">
                        <img
                          src={item.img}
                          alt={item.name}
                          className="w-full h-[280px] object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {(stockMap[item.id] ?? 1) === 0 && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="bg-white text-black text-xs font-bold px-3 py-1 rounded-full tracking-widest uppercase">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      {/* OVERLAY */}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300" />
                      {/* BOTTOM INFO */}
                      <div className="p-4 border-t border-gray-100">
                        <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-bold text-[#c9a98a]">₱{item.price.toLocaleString()}</p>
                          <button
                            onClick={(e) => handleAddToCart(e, item)}
                            disabled={(stockMap[item.id] ?? 1) === 0}
                            className={`w-8 h-8 rounded-full flex items-center justify-center transition ${
                              (stockMap[item.id] ?? 1) === 0
                                ? "bg-gray-300 text-gray-400 cursor-not-allowed"
                                : addedId === item.id
                                ? "bg-green-500 text-white"
                                : "bg-black text-white hover:bg-gray-700"
                            }`}
                            title="Add to Cart"
                          >
                            {addedId === item.id
                              ? <span className="text-xs font-bold">✓</span>
                              : <FiShoppingCart className="text-xs" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
            )}
          </AnimatePresence>

          {/* LOAD MORE */}
          {visibleCount < filteredProducts.length && (
            <div className="flex justify-center mt-10">
              <button
                onClick={() => setVisibleCount(v => v + 8)}
                className="px-10 py-3 border-2 border-black text-sm font-semibold tracking-widest uppercase hover:bg-black hover:text-white transition"
              >
                Load More ({filteredProducts.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* WHY CHOOSE US */}
      <div className="bg-white py-24 px-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Our Promise</span>
            <h2 className="text-4xl font-bold mt-2">Why Choose Chay Fashion</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            {[
              { icon: "✦", title: "Handpicked Quality", desc: "Every item is carefully curated for style, comfort, and lasting value." },
              { icon: "◈", title: "Authentic Products", desc: "Genuine Fossil watches, premium Herborist skincare, and elegant dresses." },
              { icon: "⟡", title: "Fast & Secure", desc: "Safe checkout, reliable delivery, and dedicated customer support." },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center p-8 border border-gray-100 hover:border-[#c9a98a] hover:shadow-md transition group"
              >
                <span className="text-3xl text-[#c9a98a] inline-block group-hover:scale-110 transition">{f.icon}</span>
                <h3 className="text-lg font-bold mt-4 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-2 gap-3"
            >
              <img src="/D1.jpg" alt="Fashion" className="w-full h-52 object-cover" />
              <img src="/WD1.jpg" alt="Watch" className="w-full h-52 object-cover mt-6" />
              <img src="/SCRUB1.jpg" alt="Scrub" className="w-full h-52 object-cover -mt-6" />
              <img src="/D3.jpg" alt="Dress" className="w-full h-52 object-cover" />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs tracking-[0.3em] text-gray-400 uppercase">About Us</span>
              <h2 className="text-3xl font-bold mt-2 mb-6">Fashion That Tells Your Story</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At Chay Fashion, we believe style is personal. From elegant dresses to authentic Fossil watches and premium Herborist skincare — every piece is handpicked to elevate your everyday.
              </p>
              <p className="text-gray-500 leading-relaxed mb-8 text-sm">
                Whether dressing up for a special occasion or treating yourself to luxury accessories, we make fashion accessible and enjoyable for everyone.
              </p>
              <Link href="/about">
                <button className="bg-black text-white px-8 py-3 text-sm tracking-widest uppercase hover:bg-[#c9a98a] transition">
                  Learn More
                </button>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* TESTIMONIALS */}
      {testimonials.length > 0 && (
        <div className="bg-[#faf9f7] py-24 px-10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs tracking-[0.4em] text-[#c9a98a] uppercase font-medium">Customer Love</span>
              <h2 className="text-4xl font-bold mt-2">What Our Customers Say</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((t, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-white p-8 border-t-2 border-[#c9a98a] shadow-sm hover:shadow-md transition"
                >
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, s) => (
                      <span key={s} className={s < t.rating ? "text-[#c9a98a]" : "text-gray-200"}>★</span>
                    ))}
                  </div>
                  <p className="text-sm text-gray-600 mb-6 italic leading-relaxed">&ldquo;{t.comment}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white text-xs font-bold">
                      {t.username[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{t.username}</p>
                      {t.productName && <p className="text-[10px] text-gray-400">on {t.productName}</p>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA BANNER */}
      <div className="bg-black text-white py-20 px-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs tracking-[0.5em] text-[#c9a98a] uppercase font-medium">Limited Time</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-3 mb-4">Elevate Your Style Today</h2>
          <p className="text-gray-400 text-sm mb-8 max-w-md mx-auto">Explore our full collection and find pieces that speak to you.</p>
          <Link href={loaded && !username ? "/login" : "/shop"}>
            <button className="bg-[#c9a98a] text-white px-12 py-4 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#b8956f] transition">
              BROWSE COLLECTION
            </button>
          </Link>
        </motion.div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 pt-16 pb-8 px-16">
        <div className="grid grid-cols-5 gap-10 pb-12 border-b border-gray-800">

          {/* BRAND */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white">
                <rect x="20" y="20" width="120" height="120" rx="4" transform="rotate(45 80 80)" stroke="currentColor" strokeWidth="3" fill="none"/>
                <rect x="32" y="32" width="96" height="96" rx="2" transform="rotate(45 80 80)" stroke="currentColor" strokeWidth="1.2" fill="none" opacity="0.4"/>
                <path d="M58 68 C58 58 68 52 78 52 C86 52 92 56 95 62" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
                <path d="M58 92 C58 102 68 108 78 108 C86 108 92 104 95 98" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none"/>
                <line x1="58" y1="68" x2="58" y2="92" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <line x1="102" y1="52" x2="102" y2="108" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <line x1="102" y1="52" x2="122" y2="52" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
                <line x1="102" y1="80" x2="118" y2="80" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
              </svg>
              <h2 className="text-white text-2xl font-serif italic">Chay Fashion</h2>
            </div>
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
