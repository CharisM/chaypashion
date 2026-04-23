"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiShoppingBag, FiEdit2, FiCheck, FiX, FiSearch, FiUser, FiShoppingCart, FiArrowRight, FiTag, FiSmartphone, FiPackage, FiMapPin } from "react-icons/fi";
import Link from "next/link";
import { getCart, removeFromCart, updateCartItem, CartItem } from "@/lib/cart";
import { products } from "@/lib/products";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editSize, setEditSize] = useState<string>("");
  const [editQty, setEditQty] = useState<number>(1);
  const [selected, setSelected] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [dropdown, setDropdown] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [cartLoaded, setCartLoaded] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "cod">("cod");
  const [address, setAddress] = useState({ fullName: "", phone: "", address: "", city: "", zip: "" });
  const [gcashProof, setGcashProof] = useState<File | null>(null);
  const [gcashProofPreview, setGcashProofPreview] = useState<string | null>(null);
  const [uploadingProof, setUploadingProof] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) router.push(`/search?q=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTimeout(() => router.push("/login"), 0); return; }
      setUserId(user.id);
      const cartItems = getCart(user.id);
      setCart(cartItems);
      setSelected(cartItems.map((_, i) => i));
      setCartLoaded(true);
      supabase.from("profiles").select("username").eq("id", user.id).maybeSingle()
        .then(({ data }) => setUsername(data?.username ?? user.email ?? null));
    };
    check();
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setDropdown(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleRemove = (index: number) => {
    removeFromCart(index, userId ?? undefined);
    const updated = getCart(userId ?? undefined);
    setCart(updated);
    setSelected(prev => prev.filter(i => i !== index).map(i => i > index ? i - 1 : i));
    if (editingIndex === index) setEditingIndex(null);
  };

  const toggleSelect = (index: number) => {
    setSelected(prev => prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]);
  };

  const toggleSelectAll = () => {
    setSelected(selected.length === cart.length ? [] : cart.map((_, i) => i));
  };

  const selectedItems = cart.filter((_, i) => selected.includes(i));

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditSize(cart[index].size);
    setEditQty(cart[index].qty ?? 1);
  };

  const handleSave = (index: number) => {
    updateCartItem(index, { size: editSize, qty: editQty }, userId ?? undefined);
    setCart(getCart(userId ?? undefined));
    setEditingIndex(null);
  };

  const getSizes = (itemId: number) => products.find((p) => p.id === itemId)?.sizes ?? [];
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * (item.qty ?? 1), 0);
  const shipping = selectedItems.length > 0 ? 150 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-4 bg-white border-b border-gray-100">
        <Link href="/" className="text-3xl font-serif italic">Chay Fashion</Link>
        <ul className="flex gap-8 text-sm font-medium items-center">
          <li>
            <form onSubmit={handleSearch} className="flex items-center border border-gray-200 rounded-full px-3 py-1.5 gap-2 hover:border-gray-400 transition">
              <FiSearch className="text-gray-400 text-sm shrink-0" />
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..." className="text-xs outline-none bg-transparent w-36 placeholder-gray-400" />
            </form>
          </li>
          <li><Link href="/" className="hover:text-gray-500 transition">HOME</Link></li>
          <li><Link href="/about" className="hover:text-gray-500 transition">ABOUT</Link></li>
          <li>
            <Link href="/cart" className="relative flex items-center">
              <FiShoppingCart className="text-xl" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {cart.length > 9 ? "9+" : cart.length}
                </span>
              )}
            </Link>
          </li>
          <li className="relative" ref={dropdownRef}>
            <button onClick={() => setDropdown(!dropdown)} className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-9 h-9 rounded-full bg-black flex items-center justify-center">
                <FiUser className="text-white text-lg" />
              </div>
              {username && <span className="text-sm font-medium">{username}</span>}
            </button>
            {dropdown && (
              <div className="absolute right-0 mt-2 w-44 bg-white border rounded-xl shadow-lg z-[999] overflow-hidden">
                <Link href="/profile" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">Profile</Link>
                <Link href="/orders" onClick={() => setDropdown(false)} className="block px-4 py-2 text-sm hover:bg-gray-100">My Orders</Link>
                <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-gray-100">Logout</button>
              </div>
            )}
          </li>
        </ul>
      </nav>

      {/* LOADING */}
      {!cartLoaded ? (
        <div className="flex items-center justify-center min-h-[70vh]">
          <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
        </div>

      ) : cart.length === 0 ? (

        /* EMPTY STATE */
        <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <FiShoppingBag className="text-5xl text-gray-300" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-black rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">0</span>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800">Your cart is empty</h2>
            <p className="text-gray-400 text-sm mt-2">Discover our latest collection and add your favorites.</p>
          </div>
          <Link href="/shop" className="flex items-center gap-2 bg-black text-white px-8 py-3 text-sm font-semibold tracking-widest uppercase hover:bg-gray-800 transition">
            Browse Collection <FiArrowRight />
          </Link>
        </div>

      ) : (

        /* SPLIT LAYOUT */
        <div className="flex min-h-[calc(100vh-73px)]">

          {/* LEFT — ITEMS */}
          <div className="flex-1 px-12 py-10 overflow-y-auto border-r border-gray-100">

            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-2xl font-bold">Shopping Cart</h1>
                <p className="text-gray-400 text-sm mt-0.5">{cart.length} item{cart.length !== 1 ? "s" : ""} in your bag</p>
              </div>
              <Link href="/shop" className="text-xs text-gray-400 hover:text-black transition underline underline-offset-2">
                Continue Shopping
              </Link>
            </div>

            {/* COLUMN HEADERS */}
            <div className="grid grid-cols-5 text-[10px] tracking-widest uppercase text-gray-400 pb-3 border-b border-gray-100 mb-4 px-2">
              <div className="flex items-center">
                <input type="checkbox" checked={selected.length === cart.length && cart.length > 0} onChange={toggleSelectAll} className="w-4 h-4 accent-black cursor-pointer" />
                <span className="ml-2">All</span>
              </div>
              <span className="col-span-2">Product</span>
              <span className="text-center">Size / Qty</span>
              <span className="text-right">Price</span>
            </div>

            {/* CART ITEMS */}
            {cart.map((item, index) => {
              const isEditing = editingIndex === index;
              const sizes = getSizes(item.id);
              return (
                <div
                  key={index}
                  className="group grid grid-cols-5 items-center gap-4 py-5 border-b border-gray-50 hover:bg-gray-50/50 transition rounded-xl px-2"
                >
                  {/* CHECKBOX */}
                  <div className="flex items-center">
                    <input type="checkbox" checked={selected.includes(index)} onChange={() => toggleSelect(index)} className="w-4 h-4 accent-black cursor-pointer" />
                  </div>

                  {/* PRODUCT */}
                  <div className="col-span-2 flex items-center gap-4">
                    <div className="relative w-20 h-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                      <button onClick={() => handleRemove(index)} className="absolute top-1 right-1 w-5 h-5 bg-white rounded-full shadow flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-red-50">
                        <FiX className="text-red-400 text-xs" />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <span className="text-[10px] tracking-widest text-gray-400 uppercase">{item.category}</span>
                      <p className="text-sm font-semibold text-gray-800 truncate mt-0.5">{item.name}</p>
                    </div>
                  </div>

                  {/* SIZE + QTY */}
                  <div className="text-center">
                    {isEditing ? (
                      <div className="flex flex-col items-center gap-3">
                        {sizes.length > 1 && (
                          <div>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Size</p>
                            <div className="flex gap-1 flex-wrap justify-center">
                              {sizes.map((s) => (
                                <button key={s} onClick={() => setEditSize(s)} className={`px-2 py-1 text-[10px] font-bold border transition rounded ${editSize === s ? "bg-black text-white border-black" : "border-gray-200 hover:border-black"}`}>
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                        <div>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Qty</p>
                          <div className="flex items-center gap-2">
                            <button onClick={() => setEditQty(q => Math.max(1, q - 1))} className="w-6 h-6 border border-gray-200 rounded text-sm font-bold hover:border-black transition">-</button>
                            <span className="text-sm font-bold w-4 text-center">{editQty}</span>
                            <button onClick={() => setEditQty(q => q + 1)} className="w-6 h-6 border border-gray-200 rounded text-sm font-bold hover:border-black transition">+</button>
                          </div>
                        </div>
                        <button onClick={() => handleSave(index)} className="flex items-center gap-1 text-[10px] text-green-600 font-semibold hover:text-green-700 transition">
                          <FiCheck /> Save
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => handleEdit(index)} className="inline-flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1 text-xs font-medium hover:border-black transition">
                        {item.size}{(item.qty ?? 1) > 1 ? ` x${item.qty}` : ""} <FiEdit2 className="text-[10px] text-gray-400" />
                      </button>
                    )}
                  </div>

                  {/* PRICE */}
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-800">₱{(item.price * (item.qty ?? 1)).toLocaleString()}</p>
                    {(item.qty ?? 1) > 1 && <p className="text-[10px] text-gray-400">₱{item.price.toLocaleString()} each</p>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="w-96 shrink-0 bg-[#faf9f7] px-10 py-10 flex flex-col overflow-y-auto">

            <h2 className="text-lg font-bold mb-8">Order Summary</h2>

            <div className="flex gap-2 mb-8 flex-wrap">
              {selectedItems.slice(0, 4).map((item, i) => (
                <div key={i} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm">
                  <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                </div>
              ))}
              {selectedItems.length > 4 && (
                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                  +{selectedItems.length - 4}
                </div>
              )}
              {selectedItems.length === 0 && <p className="text-xs text-gray-400 italic">No items selected</p>}
            </div>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between text-gray-500">
                <span>Subtotal ({selectedItems.length} selected)</span>
                <span>₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Shipping</span>
                <span>₱{shipping.toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between items-center">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-2xl font-bold text-gray-800">₱{total.toLocaleString()}</span>
              </div>
            </div>

            {/* SHIPPING ADDRESS */}
            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase text-gray-400 font-medium mb-3 flex items-center gap-2"><FiMapPin /> Delivery Address</p>
              <div className="space-y-2">
                <input type="text" placeholder="Full Name" value={address.fullName} onChange={e => setAddress(p => ({ ...p, fullName: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black bg-white" />
                <input type="text" placeholder="Phone Number (09XXXXXXXXX)" value={address.phone} onChange={e => setAddress(p => ({ ...p, phone: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black bg-white" />
                {address.phone && !/^09\d{9}$/.test(address.phone) && (
                  <p className="text-red-400 text-[10px] mt-1 px-1">Must be 11 digits starting with 09</p>
                )}
                <input type="text" placeholder="Street Address" value={address.address} onChange={e => setAddress(p => ({ ...p, address: e.target.value }))} className="w-full border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black bg-white" />
                <div className="flex gap-2">
                  <input type="text" placeholder="City" value={address.city} onChange={e => setAddress(p => ({ ...p, city: e.target.value }))} className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black bg-white" />
                  <input type="text" placeholder="ZIP" value={address.zip} onChange={e => setAddress(p => ({ ...p, zip: e.target.value }))} className="w-20 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-black bg-white" />
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="mb-6">
              <p className="text-xs tracking-widest uppercase text-gray-400 font-medium mb-3">Payment Method</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setPaymentMethod("gcash")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition ${
                    paymentMethod === "gcash"
                      ? "bg-blue-500 text-white border-blue-500"
                      : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"
                  }`}
                >
                  <FiSmartphone className="text-base" /> GCash
                </button>
                <button
                  onClick={() => setPaymentMethod("cod")}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition ${
                    paymentMethod === "cod"
                      ? "bg-black text-white border-black"
                      : "bg-white text-gray-600 border-gray-200 hover:border-black"
                  }`}
                >
                  <FiPackage className="text-base" /> COD
                </button>
              </div>
              {paymentMethod === "gcash" && (
                <div className="mt-3 bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-600 space-y-3">
                  <p>📱 GCash Number: <span className="font-bold">0933-699-5665</span></p>
                  <p>Send payment then upload your screenshot below.</p>
                  <div>
                    <label className="block text-[10px] tracking-widest uppercase text-blue-500 font-semibold mb-1">Upload Proof of Payment</label>
                    {gcashProofPreview ? (
                      <div className="relative">
                        <img src={gcashProofPreview} alt="GCash proof" className="w-full h-36 object-cover rounded-lg border border-blue-200" />
                        <button
                          onClick={() => { setGcashProof(null); setGcashProofPreview(null); }}
                          className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50"
                        >
                          <FiX className="text-red-400 text-xs" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer hover:border-blue-400 transition bg-white">
                        <FiSmartphone className="text-blue-300 text-xl mb-1" />
                        <span className="text-[10px] text-blue-400">Click to upload screenshot</span>
                        <input
                          type="file" accept="image/*" className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setGcashProof(file);
                            setGcashProofPreview(URL.createObjectURL(file));
                          }}
                        />
                      </label>
                    )}
                  </div>
                </div>
              )}
              {paymentMethod === "cod" && (
                <div className="mt-3 bg-gray-50 border border-gray-100 rounded-xl p-3 text-xs text-gray-500">
                  📦 Pay when your order arrives at your doorstep.
                </div>
              )}
            </div>

            <div className="flex gap-2 mb-6">
              <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2 bg-white">
                <FiTag className="text-gray-400 text-sm shrink-0" />
                <input type="text" placeholder="Promo code" className="text-xs outline-none bg-transparent flex-1 placeholder-gray-400" />
              </div>
              <button className="bg-black text-white text-xs px-4 rounded-xl font-semibold hover:bg-gray-800 transition">Apply</button>
            </div>

            {selectedItems.length > 0 ? (
              <button
                onClick={async () => {
                  if (!address.fullName || !address.phone || !address.address || !address.city) {
                    alert("Please fill in all delivery address fields."); return;
                  }
                  if (paymentMethod === "gcash" && !gcashProof) {
                    alert("Please upload your GCash proof of payment."); return;
                  }
                  if (address.phone && !/^09\d{9}$/.test(address.phone)) {
                    alert("Phone number must be 11 digits starting with 09 (e.g. 09123456789)."); return;
                  }
                  setUploadingProof(true);
                  let proofUrl: string | null = null;
                  if (paymentMethod === "gcash" && gcashProof) {
                    const ext = gcashProof.name.split(".").pop();
                    const path = `gcash-proofs/${Date.now()}.${ext}`;
                    const { error } = await supabase.storage.from("order-proofs").upload(path, gcashProof);
                    if (!error) {
                      const { data } = supabase.storage.from("order-proofs").getPublicUrl(path);
                      proofUrl = data.publicUrl;
                    }
                  }
                  const key = userId ? `chay_cart_${userId}` : "chay_cart_guest";
                  localStorage.setItem(key, JSON.stringify(selectedItems));
                  localStorage.setItem("chay_payment_method", paymentMethod);
                  localStorage.setItem("chay_delivery_address", JSON.stringify(address));
                  if (proofUrl) localStorage.setItem("chay_gcash_proof_url", proofUrl);
                  setUploadingProof(false);
                  router.push("/order-confirmation");
                }}
                disabled={uploadingProof}
                className="w-full bg-black text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition flex items-center justify-center gap-3 rounded-xl disabled:opacity-60"
              >
                {uploadingProof ? "Uploading..." : <>Checkout ({selectedItems.length}) <FiArrowRight /></>}
              </button>
            ) : (
              <button disabled className="w-full bg-gray-200 text-gray-400 py-4 text-sm font-bold tracking-widest uppercase rounded-xl cursor-not-allowed">
                Select Items to Checkout
              </button>
            )}

            <div className="mt-auto pt-8 text-center">
              <p className="text-[10px] tracking-widest text-gray-300 uppercase font-serif italic">Chay Fashion</p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
