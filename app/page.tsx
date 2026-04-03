"use client";

import Link from "next/link";
import { FiSearch } from "react-icons/fi";

const products = [
  { id: 1, img: "/dress1.jpg" },
  { id: 2, img: "/dress2.jpg" },
  { id: 3, img: "/dress3.jpg" },
  { id: 4, img: "/dress4.jpg" },
  { id: 5, img: "/dress5.jpg" },
  { id: 6, img: "/dress6.jpg" },
  { id: 7, img: "/dress7.jpg" },
  { id: 8, img: "/dress8.jpg" },
];

export default function Home() {
  return (
    <div className="w-full">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white">
        <h1 className="text-3xl font-serif italic">Chay Passion</h1>

        <ul className="flex gap-8 text-sm font-medium items-center">
          <li><Link href="/home">HOME</Link></li>
          <li><Link href="/about">ABOUT</Link></li>
          <li><Link href="/contact">CONTACT US</Link></li>
          <li>
            <FiSearch className="text-lg cursor-pointer hover:opacity-70 transition" />
          </li>
        </ul>
      </nav>

      {/* HERO */}
      <div
        className="h-screen bg-cover bg-center relative"
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

            {/* LOGIN REQUIRED */}
            <Link href="/login">
              <button className="mt-8 border-2 border-white px-6 py-2 hover:bg-white hover:text-black transition">
                SHOP NOW
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="bg-gray-100 py-16 px-10 text-center">
        <h2 className="text-xl font-semibold">Discover NEW Arrivals</h2>
        <p className="text-gray-500 text-sm mb-10">Recently added shirts!</p>

        <div className="grid grid-cols-4 gap-6">
          {products.map((item) => (
            <Link key={item.id} href="/login">
              <div className="bg-white p-2 cursor-pointer hover:shadow-lg transition">
                <img
                  src={item.img}
                  alt="dress"
                  className="w-full h-[250px] object-cover"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* FEATURES (small icons section) */}
      <div className="flex justify-around text-sm py-6 bg-white border-t">
        <p>🚚 Free Shipping</p>
        <p>💬 Support 24/7</p>
        <p>🔄 30 Days Return</p>
        <p>🔒 100% Payment Secure</p>
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
            <h3 className="font-semibold mb-3">HELP</h3>
            <ul className="space-y-2">
              <li>Tracking</li>
              <li>Order Status</li>
              <li>Shipping</li>
              <li>FAQ</li>
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