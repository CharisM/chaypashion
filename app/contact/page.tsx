"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { FiSearch, FiUser } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function Contact() {
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    const getUser = async (user: any) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).single();
        setUsername(data?.username ?? user.email ?? null);
      } else {
        setUsername(null);
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      getUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      getUser(session?.user ?? null);
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
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow">
        <Link href="/"><h1 className="text-3xl font-serif italic">Chay Fashion</h1></Link>
        <ul className="flex gap-8 text-sm font-medium items-center">
          <li><Link href="/">HOME</Link></li>
          <li><Link href="/about">ABOUT</Link></li>
          <li className="text-blue-600">CONTACT US</li>
          <li><FiSearch className="text-lg cursor-pointer hover:opacity-70 transition" /></li>
          <li className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdown(!dropdown)}
              className="flex items-center gap-2 hover:opacity-80 transition"
            >
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                <FiUser className="text-white text-lg" />
              </div>
              {username && <span className="text-sm font-medium">{username}</span>}
            </button>
            {dropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-[999] overflow-hidden">
                <Link href="/profile" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                {username
                  ? <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">Logout</button>
                  : <Link href="/login" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Login</Link>
                }
              </div>
            )}
          </li>
        </ul>
      </nav>

   {/* BANNER IMAGE */}
        <div
      className="relative w-full h-64 md:h-72 lg:h-80 flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: "url('/abct.jpg')" }}
    >
      <h1 className="text-white text-3xl md:text-4xl font-bold">
        CONTACT US
      </h1>
    </div>

      {/* CONTENT */}
      <div className="max-w-6xl mx-auto px-5 py-12 grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* FORM */}
        <div className="md:col-span-2 bg-white p-8 shadow rounded">
          <h2 className="text-2xl font-semibold mb-4">We would love to hear from you.</h2>
          <p className="text-gray-600 mb-6">
            If you have any query or any type of suggestion, you can contact us here.
          </p>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Name"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full border border-gray-300 rounded px-3 py-2"
            />
            <textarea
              placeholder="Message"
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2"
            ></textarea>
            <button type="submit" className="bg-black text-white px-6 py-2 rounded">
              SEND MESSAGE
            </button>
          </form>
        </div>

        {/* CONTACT INFO */}
        <div className="bg-gray-50 p-8 rounded shadow space-y-6">
          <div>
            <h3 className="font-semibold">📍 Visit Us</h3>
            <p className="text-gray-500">Philippines</p>
          </div>
          <div>
            <h3 className="font-semibold">📧 Email</h3>
            <p className="text-gray-500">support@chayfashion.com</p>
          </div>
          <div>
            <h3 className="font-semibold">📞 Phone</h3>
            <p className="text-gray-500">09123456789</p>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="bg-white text-gray-700 px-16 py-12 border-t">
        <div className="grid grid-cols-4 gap-10 text-sm">

          <div>
            <h3 className="font-semibold mb-3">COMPANY</h3>
            <ul className="space-y-2">
              <li>About Us</li>
              <li>Shop</li>
              <li>Contact</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">MORE</h3>
            <ul className="space-y-2">
              <li>Offers</li>
              <li>Gift Cards</li>
              <li>Terms</li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3">NEWSLETTER</h3>
            <div className="flex border-b border-gray-400 pb-1">
              <input
                type="email"
                placeholder="Enter email"
                className="bg-transparent outline-none flex-1"
              />
              <button className="ml-2">→</button>
            </div>
          </div>

        </div>

        <div className="border-t mt-10 pt-6 text-xs flex justify-between">
          <p>© 2026 Chay Passion</p>
          <div className="flex gap-4">
            <p>Privacy Policy</p>
            <p>Terms</p>
          </div>
        </div>
      </footer>

    </div>
  );
}