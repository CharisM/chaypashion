import Link from "next/link";
import { FiFacebook, FiMapPin, FiPhone, FiMail } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="bg-black text-gray-400 pt-16 pb-8 px-16">
      <div className="grid grid-cols-5 gap-10 pb-12 border-b border-gray-800">

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
  );
}
