"use client";

import Link from "next/link";
import { FiSearch } from "react-icons/fi";

export default function Contact() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow">
        <h1 className="text-3xl font-serif italic">Chay Fashion</h1>
        <ul className="flex gap-8 text-sm font-medium items-center">
          <li><Link href="/">HOME</Link></li>
          <li><Link href="/about">ABOUT</Link></li>
          <li className="text-blue-600">CONTACT US</li>
          <li>
            <Link href="/search">
                <FiSearch className="text-lg cursor-pointer" />
            </Link>
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