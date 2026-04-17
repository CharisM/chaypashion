"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FiSearch, FiUser } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { products } from "@/lib/products";

export default function Home() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const dropdownRef = useRef<HTMLLIElement>(null);

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
    router.push("/login");
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
          <li><Link href="/contact">CONTACT US</Link></li>
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
                    <Link href="/cart" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">My Cart</Link>
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
    <div
      className="h-[70vh] bg-cover bg-center relative"
      style={{ backgroundImage: "url('/BG.jpg')" }}
    >
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative flex items-center h-full px-16">
        <div className="text-white max-w-xl">
          <h1 className="text-5xl font-bold leading-tight drop-shadow-lg">
            STYLIST PICKS BEAT
            <br />
            THE HEAT
          </h1>

          <Link href={loaded && !username ? "/login" : "/shop"}>
            <button className="mt-8 border-2 border-white px-6 py-2 hover:bg-white hover:text-black transition">
              SHOP NOW
            </button>
          </Link>
        </div>
      </div>
    </div>
      {/* PRODUCTS */}
      <div className="bg-white py-20 px-10">
        {/* SECTION HEADER */}
        <div className="flex flex-col items-center mb-14">
          <span className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-3">What's New</span>
          <h2 className="text-3xl font-bold tracking-tight">New Arrivals</h2>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-gray-400 text-sm">Fresh styles just dropped</span>
          </div>
          <div className="w-full text-left mt-4 flex gap-6">
            <Link href="/shop" className="text-black text-sm hover:text-gray-600">Dress</Link>
           
            <Link href="/shop" className="text-black text-sm hover:text-gray-600">Watch</Link>
           
            <Link href="/shop" className="text-black text-sm hover:text-gray-600">Body Essentials</Link>
            
            <Link href="/shop" className="text-black text-sm hover:text-gray-600">View All</Link>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {products.map((item) => (
            <Link key={item.id} href={loaded && !username ? "/login" : `/product/${item.id}`}>
              <div className="group relative overflow-hidden bg-gray-50 cursor-pointer">
                <img
                  src={item.img}
                  alt={item.name}
                  className="w-full h-[300px] object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300 flex items-end justify-center pb-6 opacity-0 group-hover:opacity-100">
                  <span className="bg-white text-black text-xs font-semibold px-5 py-2 tracking-widest uppercase">View</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        
      </div>

      {/* FOOTER */}
      <footer className="bg-black text-gray-400 pt-16 pb-8 px-16">
        <div className="grid grid-cols-2 gap-10 pb-12 border-b border-gray-800">

          {/* BRAND */}
          <div>
            <h2 className="text-white text-2xl font-serif italic mb-4">Chay Fashion</h2>
            <p className="text-sm leading-relaxed text-gray-500">
              Modern styles for everyday wear. Quality fashion made accessible for everyone.
            </p>
          </div>

          {/* COMPANY */}
          <div>
            <h3 className="text-white text-xs tracking-[0.2em] uppercase mb-5">Company</h3>
            <ul className="space-y-3 text-sm">
              <li><Link href="/about" className="hover:text-white transition">About Us</Link></li>
              <li><Link href="/" className="hover:text-white transition">Shop</Link></li>
              <li><Link href="/contact" className="hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

        </div>

        {/* BOTTOM */}
        <div className="pt-6 flex justify-between items-center text-xs text-gray-600">
          <p>© 2026 Chay Fashion. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-white transition cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

    </div>
  );
}