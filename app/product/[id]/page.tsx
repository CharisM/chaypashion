"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FiUser, FiSearch, FiShoppingCart, FiArrowLeft, FiFacebook } from "react-icons/fi";
import { supabase } from "@/lib/supabase";
import { products } from "@/lib/products";
import { addToCart, getCart } from "@/lib/cart";
import { getStock } from "@/lib/stock";
import { getReviews, submitReview, getAverageRating, Review } from "@/lib/reviews";
import { motion } from "framer-motion";

export default function ProductDetail() {
  const { id } = useParams();
  const router = useRouter();
  const product = products.find((p) => p.id === Number(id));

  const [username, setUsername] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [stockLoaded, setStockLoaded] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [cartMsg, setCartMsg] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [stock, setStock] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const currentImg = product?.variants ? product.variants[selectedVariant].img : product?.img;

  useEffect(() => {
    if (product) {
      getStock(product.id).then(v => { setStock(v); setStockLoaded(true); });
      getReviews(product.id).then(setReviews);
    }
  }, [product]);

  useEffect(() => { setCartCount(getCart(userId ?? undefined).length); }, [loaded, userId]);

  useEffect(() => {
    const getUser = async (user: any) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("username").eq("id", user.id).maybeSingle();
        setUsername(data?.username ?? user.email ?? null);
      } else {
        setUsername(null);
      }
      setLoaded(true);
      setUserId(user?.id ?? null);
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

  const handleSubmitReview = async () => {
    setReviewError("");
    if (!username) { setReviewError("Please login to leave a review."); return; }
    if (!reviewComment.trim()) { setReviewError("Please write a comment."); return; }
    setSubmittingReview(true);
    const { error } = await submitReview(product!.id, userId!, username, reviewRating, reviewComment.trim());
    setSubmittingReview(false);
    if (error) { setReviewError(error); return; }
    setReviewSuccess(true);
    setReviewComment("");
    setReviewRating(5);
    getReviews(product!.id).then(setReviews);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  const handleAddToCart = () => {
    if (product!.category !== "Dress" && !selectedSize) { setCartMsg("Please select a size first."); return; }
    if (stock !== null && stock <= 0) { setCartMsg("Sorry, this item is out of stock."); return; }
    const selectedColor = product!.variants ? product!.variants[selectedVariant].color : undefined;
    const cartImg = product!.variants ? product!.variants[selectedVariant].img : product!.img;
    addToCart({
      id: product!.id,
      name: product!.name + (selectedColor ? ` (${selectedColor})` : ""),
      img: cartImg,
      price: product!.price,
      size: product!.category === "Dress" ? "Free Size" : (selectedSize ?? product!.sizes[0]),
      category: product!.category
    }, userId ?? undefined);
    setCartMsg(`✓ Added to cart!`);
    setCartCount(getCart(userId ?? undefined).length);
    setTimeout(() => setCartMsg(""), 3000);
  };

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Product not found.</p>
    </div>
  );

  if (!loaded || !stockLoaded) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
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
                    <Link href="/orders" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">My Orders</Link>
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

        <div className="grid grid-cols-2 gap-14 items-start">

          {/* IMAGE */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gray-50 overflow-hidden sticky top-8 cursor-zoom-in"
            onClick={() => setZoomed(true)}
          >
            <img src={currentImg} alt={product.name} className="w-full h-[500px] object-cover hover:scale-105 transition duration-500" />
            <p className="text-center text-[10px] text-gray-400 py-2 tracking-widest uppercase">Click to zoom</p>
          </motion.div>

          {/* LIGHTBOX */}
          {zoomed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center cursor-zoom-out"
              onClick={() => setZoomed(false)}
            >
              <motion.img
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                src={currentImg}
                alt={product.name}
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-xl shadow-2xl"
              />
              <button className="absolute top-6 right-6 text-white text-3xl hover:text-gray-300 transition">✕</button>
            </motion.div>
          )}

          {/* DETAILS */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col"
          >
            <span className="text-xs tracking-[0.3em] text-gray-400 uppercase mb-2">{product.category}</span>
            <h1 className="text-3xl font-bold mb-3">{product.name}</h1>
            <p className="text-2xl font-semibold mb-3">₱{product.price.toLocaleString()}</p>
            {stock !== null && (
              <div className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full mb-5 ${
                stock === 0 ? "bg-red-100 text-red-500" : stock <= 3 ? "bg-orange-100 text-orange-500" : "bg-green-100 text-green-600"
              }`}>
                {stock === 0 ? "Out of Stock" : stock <= 3 ? `⚠ Only ${stock} left!` : `✓ In Stock (${stock})`}
              </div>
            )}
            <p className="text-gray-500 text-sm leading-relaxed mb-8">{product.description}</p>

            {/* COLOR VARIANTS */}
            {product.variants && product.variants.length > 0 && (
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-widest mb-3">
                  Color: <span className="font-normal text-gray-500">{product.variants[selectedVariant].color}</span>
                </p>
                <div className="flex gap-3 flex-wrap">
                  {product.variants.map((variant, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedVariant(i)}
                      className={`flex items-center gap-2 px-4 py-2 border text-sm font-medium transition rounded-lg ${
                        selectedVariant === i
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:border-black text-gray-700"
                      }`}
                    >
                      <img src={variant.img} alt={variant.color} className="w-8 h-8 object-cover rounded" />
                      {variant.color}
                    </motion.button>
                  ))}
                </div>
              </div>
            )}

            {/* MEASUREMENTS FOR DRESS / SIZE SELECTOR FOR OTHERS */}
            {product.category === "Dress" ? (
              <div className="mb-8">
                <p className="text-sm font-semibold uppercase tracking-widest mb-4">Measurements</p>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Bust",   value: product.measurements?.bust },
                    { label: "Waist",  value: product.measurements?.waist },
                    { label: "Length", value: product.measurements?.length },
                  ].map((m) => (
                    <div key={m.label} className="border border-gray-100 rounded-xl p-4 text-center bg-gray-50">
                      <p className="text-[10px] tracking-widest uppercase text-gray-400 mb-1">{m.label}</p>
                      <p className="text-sm font-bold text-gray-800">{m.value}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3">* Free Size — fits most body types.</p>
              </div>
            ) : (
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
            )}

            {/* ADD TO CART */}
            <button
              onClick={handleAddToCart}
              disabled={stock === 0}
              className={`ripple-btn flex items-center justify-center gap-3 py-4 text-sm font-semibold tracking-widest uppercase transition ${
                stock === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              <FiShoppingCart className="text-lg" />
              {stock === 0 ? "Out of Stock" : "Add to Cart"}
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

      {/* REVIEWS */}
      <div className="max-w-5xl mx-auto px-8 py-12 border-t border-gray-100">
        <div className="flex items-end gap-4 mb-8">
          <div>
            <span className="text-xs tracking-[0.3em] text-[#c9a98a] uppercase font-medium">Customer Feedback</span>
            <h2 className="text-2xl font-bold mt-1">Reviews & Ratings</h2>
          </div>
          {reviews.length > 0 && (
            <div className="ml-auto flex items-center gap-2">
              <div className="flex">
                {[1,2,3,4,5].map(s => (
                  <span key={s} className={`text-lg ${s <= Math.round(getAverageRating(reviews)) ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                ))}
              </div>
              <span className="text-sm font-bold text-gray-700">{getAverageRating(reviews).toFixed(1)}</span>
              <span className="text-xs text-gray-400">({reviews.length} review{reviews.length !== 1 ? "s" : ""})</span>
            </div>
          )}
        </div>

        {/* SUBMIT REVIEW */}
        <div className="bg-[#faf9f7] rounded-2xl p-6 mb-8 border border-[#e8e0d8]">
          <p className="text-sm font-semibold mb-4">Leave a Review</p>
          {/* STAR PICKER */}
          <div className="flex gap-1 mb-4">
            {[1,2,3,4,5].map(s => (
              <button
                key={s}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setReviewRating(s)}
                className="text-2xl transition"
              >
                <span className={s <= (hoverRating || reviewRating) ? "text-yellow-400" : "text-gray-300"}>★</span>
              </button>
            ))}
            <span className="text-xs text-gray-400 ml-2 self-center">{["Terrible","Bad","Okay","Good","Excellent"][reviewRating - 1]}</span>
          </div>
          <textarea
            value={reviewComment}
            onChange={e => setReviewComment(e.target.value)}
            placeholder={username ? "Share your thoughts about this product..." : "Please login to leave a review."}
            disabled={!username}
            rows={3}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-black resize-none bg-white disabled:bg-gray-50 disabled:text-gray-400"
          />
          {reviewError && <p className="text-red-500 text-xs mt-2">{reviewError}</p>}
          {reviewSuccess && <p className="text-green-600 text-xs mt-2">✓ Review submitted! Thank you.</p>}
          <button
            onClick={handleSubmitReview}
            disabled={submittingReview || !username}
            className="mt-3 bg-black text-white text-xs font-bold px-6 py-2.5 rounded-xl hover:bg-gray-800 transition disabled:opacity-50 tracking-widest uppercase"
          >
            {submittingReview ? "Submitting..." : "Submit Review"}
          </button>
          {!username && (
            <Link href="/login" className="ml-3 text-xs text-blue-500 hover:underline">Login to review</Link>
          )}
        </div>

        {/* REVIEW LIST */}
        {reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-3">★</p>
            <p className="text-sm">No reviews yet. Be the first to review this product!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{r.username}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{new Date(r.createdAt).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" })}</p>
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(s => (
                      <span key={s} className={`text-sm ${s <= r.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
              </motion.div>
            ))}
          </div>
        )}
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
