"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiUser, FiSearch, FiShoppingCart, FiArrowLeft, FiFacebook } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { products } from "@/lib/products";
import { addToCart, getCart } from "@/lib/cart";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const product = products.find((p) => p.id === Number(id));

  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [cartMsg, setCartMsg] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => { setCartCount(getCart().length); }, [loaded]);

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

  const handleAddToCart = () => {
    if (!selectedSize) { setCartMsg("Please select a size first."); return; }
    addToCart({ id: product!.id, name: product!.name, img: product!.img, price: product!.price, size: selectedSize, category: product!.category });
    setCartMsg(`✓ Added to cart — Size ${selectedSize}`);
    setCartCount(getCart().length);
    setTimeout(() => setCartMsg(""), 3000);
  };

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Product not found.</p>
    </div>
  );

  return (
    <div className="w-full min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow-sm">
        <Link href="/"><h1 className="text-3xl font-serif italic">Chay Fashion</h1></Link>
        <ul className="flex gap-8 text-sm font-medium items-center">
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
      <div className="max-w-5xl mx-auto px-8 py-12">

        {/* BACK */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-black mb-8 transition">
          <FiArrowLeft /> Back
        </button>

        <div className="grid grid-cols-2 gap-14">

          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 overflow-hidden"
          >
            <img src={product.img} alt={product.name} className="w-full h-[500px] object-cover" />
          </motion.div>

          {/* DETAILS */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col justify-center"
          >
            <span className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-2">{product.category}</span>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
            <p className="text-2xl font-semibold mb-5">₱{product.price.toLocaleString()}</p>
            <p className="text-gray-500 text-sm leading-relaxed mb-8">{product.description}</p>

            {/* SIZE */}
            <div className="mb-8">
              <p className="text-sm font-semibold uppercase tracking-widest mb-3">Select Size</p>
              <div className="flex gap-3 flex-wrap">
                {product.sizes.map((size) => (
                  <motion.button
                    key={size}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 border text-sm font-medium transition ${
                      selectedSize === size
                        ? "bg-black text-white border-black"
                        : "bg-white text-black border-gray-300 hover:border-black"
                    }`}
                  >
                    {size}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              className="ripple-btn flex items-center justify-center gap-3 bg-black text-white py-4 text-sm font-semibold tracking-widest uppercase hover:bg-gray-800 transition"
            >
              <FiShoppingCart className="text-lg" />
              Add to Cart
            </button>

            {cartMsg && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-3 text-sm ${cartMsg.startsWith("✓") ? "text-green-600" : "text-red-500"}`}
              >
                {cartMsg}
              </motion.p>
            )}
          </motion.div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 pt-16 pb-8 px-16 mt-16">
        <div className="grid grid-cols-4 gap-10 pb-12 border-b border-gray-800">
          <div className="col-span-1">
            <h2 className="text-white text-2xl font-serif italic mb-4">Chay Fashion</h2>
            <p className="text-sm leading-relaxed text-gray-500">Modern styles for everyday wear. Quality fashion made accessible for everyone.</p>
          </div>
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Quick Links</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-white transition">Home</Link></li>
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Categories</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/" className="hover:text-white transition">Dress</Link></li>
              <li><Link href="/" className="hover:text-white transition">Watch</Link></li>
              <li><Link href="/" className="hover:text-white transition">Herborist Scrub</Link></li>
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
