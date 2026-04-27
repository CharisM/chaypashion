import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="text-8xl font-bold text-gray-100">404</p>
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Page not found</h1>
        <p className="text-gray-400 text-sm mt-2">The page you're looking for doesn't exist or has been removed.</p>
      </div>
      <Link href="/" className="bg-black text-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-gray-800 transition">
        Back to Home
      </Link>
    </div>
  );
}
