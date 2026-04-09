import Link from "next/link";
import { FiSearch } from "react-icons/fi";

export default function About() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white shadow">
        <h1 className="text-3xl font-serif italic">Chay Fashion</h1>
        <ul className="flex gap-8 text-sm font-medium items-center">
          <li><Link href="/">HOME</Link></li>
          <li className="text-blue-600">ABOUT</li>
          <li><Link href="/contact">CONTACT US</Link></li>
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
       ABOUT CHAY FASHION
      </h1>
    </div>

      {/* ABOUT CONTENT */}
      <div className="flex flex-col md:flex-row justify-center items-start max-w-6xl mx-auto my-8 px-5 gap-8">

        {/* TEXT SECTION */}
        <div className="flex-1 space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold">Our Mission</h2>
          <p className="text-gray-600 text-sm md:text-base">
            Chay Fashion brings modern and stylish outfits for everyday wear. We focus on comfort, quality, and affordable fashion for everyone. Our goal is to make fashion accessible and enjoyable, while helping you express your unique style.
          </p>

          <div className="grid grid-cols-3 gap-3 text-xs md:text-sm mt-4">
            <div className="bg-gray-100 p-3 text-center rounded shadow-sm">✨ Trendy</div>
            <div className="bg-gray-100 p-3 text-center rounded shadow-sm">💎 Quality</div>
            <div className="bg-gray-100 p-3 text-center rounded shadow-sm">🚚 Fast</div>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="flex-1 hidden md:block">
          <img
            src="/about-img.jpg"
            alt="Fashion Display"
            className="w-full h-full object-cover rounded shadow"
          />
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