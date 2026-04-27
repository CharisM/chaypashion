"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiSearch, FiUser, FiShoppingCart, FiMenu, FiX } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { getCart } from "@/lib/cart";
import { ADMIN_EMAIL } from "@/lib/orders";

export default function Navbar() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [search, setSearch] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getUser = async (user: any) => {
      if (user) {
        if (user.email === ADMIN_EMAIL) { router.replace("/admin"); return; }
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
        setUsername(data?.username ?? user.email ?? null);
        setUserId(user.id);
        setCartCount(getCart(user.id).length);
      } else {
        setUsername(null);
        setUserId(null);
      }
      setLoaded(true);
    };
    supabase.auth.getSession().then(({ data: { session } }) => getUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" || event === "SIGNED_IN") getUser(session?.user ?? null);
      else if (event === "SIGNED_OUT") { setUsername(null); setUserId(null); setLoaded(true); }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setCartCount(getCart(userId ?? undefined).length);
  }, [loaded, userId]);

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
    if (search.trim()) { router.push(`/search?q=${encodeURIComponent(search.trim())}`); setMobileOpen(false); }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUsername(null);
    setDropdown(false);
    setMobileOpen(false);
    router.push("/");
  };

  return (
    <nav className="bg-white shadow-sm relative z-50">
      <div className="flex justify-between items-center px-6 md:px-12 py-4">

        {/* LOGO */}
        <Link href="/" className="text-2xl md:text-3xl font-serif italic shrink-0">Chay Fashion</Link>

        {/* DESKTOP NAV */}
        <ul className="hidden md:flex gap-8 text-sm font-medium items-center">
          <li><Link href="/" className="hover:text-gray-500 transition">HOME</Link></li>
          <li><Link href="/about" className="hover:text-gray-500 transition">ABOUT</Link></li>
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
          <li className="relative">
            <div ref={dropdownRef}>
              <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 hover:opacity-80 transition">
                <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                  <FiUser className="text-white text-lg" />
                </div>
                {loaded && username && <span className="text-sm font-medium truncate max-w-[100px]">{username}</span>}
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
            </div>
          </li>
        </ul>

        {/* MOBILE RIGHT ICONS */}
        <div className="flex md:hidden items-center gap-4">
          <Link href="/cart" className="relative flex items-center">
            <FiShoppingCart className="text-xl" />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} className="text-2xl">
            {mobileOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 space-y-3">
          <form onSubmit={handleSearch} className="flex items-center border border-gray-300 rounded-full px-3 py-2 gap-2">
            <FiSearch className="text-gray-400 text-sm shrink-0" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="text-sm outline-none bg-transparent flex-1 placeholder-gray-400" />
          </form>
          <Link href="/" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2 border-b border-gray-50">HOME</Link>
          <Link href="/about" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2 border-b border-gray-50">ABOUT</Link>
          {username ? (
            <>
              <Link href="/profile" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2 border-b border-gray-50">Profile</Link>
              <Link href="/orders" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2 border-b border-gray-50">My Orders</Link>
              <button onClick={handleLogout} className="block w-full text-left text-sm font-medium py-2 text-red-500">Logout</button>
            </>
          ) : (
            <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-sm font-medium py-2">Login</Link>
          )}
        </div>
      )}
    </nav>
  );
}
