"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CartItem } from "@/lib/cart";
import { saveOrder, clearCart, PaymentStatus } from "@/lib/orders";
import { deductStock } from "@/lib/stock";
import { FiMapPin, FiSmartphone, FiPackage, FiArrowRight, FiX } from "react-icons/fi";
import Navbar from "@/components/Navbar";

export default function BuyNowPage() {
  const router = useRouter();
  const [item, setItem] = useState<CartItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [address, setAddress] = useState({ fullName: "", phone: "", address: "", city: "" });
  const [addressErrors, setAddressErrors] = useState<Record<string, boolean>>({});
  const [paymentMethod, setPaymentMethod] = useState<"gcash" | "cod">("cod");
  const [gcashProof, setGcashProof] = useState<File | null>(null);
  const [gcashProofPreview, setGcashProofPreview] = useState<string | null>(null);
  const [placing, setPlacing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUserId(user.id);
      setUserEmail(user.email ?? null);
      const { data: profile } = await supabase.from("profiles").select("username, phone, address, city").eq("id", user.id).maybeSingle();
      if (profile) setAddress({ fullName: profile.username ?? "", phone: profile.phone ?? "", address: profile.address ?? "", city: profile.city ?? "" });
      const raw = localStorage.getItem("chay_buynow_item");
      if (!raw) { router.push("/shop"); return; }
      setItem(JSON.parse(raw));
      setLoaded(true);
    };
    init();
  }, []);

  const subtotal = item ? item.price * (item.qty ?? 1) : 0;
  const shipping = 150;
  const total = subtotal + shipping;

  const handlePlaceOrder = async () => {
    const errors: Record<string, boolean> = {};
    if (!address.fullName) errors.fullName = true;
    if (!address.phone) errors.phone = true;
    if (!address.address) errors.address = true;
    if (!address.city) errors.city = true;
    if (address.phone && !/^09\d{9}$/.test(address.phone)) errors.phone = true;
    if (Object.keys(errors).length > 0) { setAddressErrors(errors); return; }
    if (paymentMethod === "gcash" && !gcashProof) { alert("Please upload your GCash proof of payment."); return; }

    setPlacing(true);
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

    const num = "CF-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const paymentStatus: PaymentStatus = paymentMethod === "gcash" ? "unpaid" : "paid";
    const order = {
      orderNumber: num,
      items: [item!],
      subtotal,
      shipping,
      total,
      date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
      expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
      delivered: false,
      status: "pending" as const,
      paymentStatus,
      paymentMethod,
      customerName: address.fullName,
      customerPhone: address.phone,
      customerAddress: `${address.address}, ${address.city}`,
      gcashProofUrl: proofUrl ?? undefined,
    };

    const { error: saveError } = await saveOrder(order, userId!);
    if (saveError) { alert(`Failed to place order: ${saveError}`); setPlacing(false); return; }

    await deductStock(item!.id, item!.qty ?? 1);
    localStorage.removeItem("chay_buynow_item");
    sessionStorage.setItem("chay_order_placed", "1");

    // Store for order-confirmation page
    const key = userId ? `chay_cart_${userId}` : "chay_cart_guest";
    localStorage.setItem(key, JSON.stringify([item]));
    localStorage.setItem("chay_payment_method", paymentMethod);
    localStorage.setItem("chay_delivery_address", JSON.stringify(address));
    if (proofUrl) localStorage.setItem("chay_gcash_proof_url", proofUrl);

    if (userEmail) {
      try {
        await fetch("/api/send-order-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: userEmail, orderNumber: num, items: [item], subtotal, shipping, total, paymentMethod, deliveryAddress: address }),
        });
      } catch (e) { console.error("Email send failed:", e); }
    }

    clearCart(userId!);
    router.push("/order-confirmation");
  };

  if (!loaded) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <p className="text-xs tracking-[0.3em] uppercase text-gray-400 font-medium mb-1">Checkout</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-8">Buy Now</h1>

        <div className="flex flex-col md:flex-row gap-8">

          {/* LEFT — FORM */}
          <div className="flex-1 space-y-6">

            {/* DELIVERY ADDRESS */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs tracking-widest uppercase text-gray-400 font-medium mb-4 flex items-center gap-2"><FiMapPin /> Delivery Address</p>
              <div className="space-y-3">
                <div>
                  <input type="text" placeholder="Full Name *" value={address.fullName} onChange={e => { setAddress(p => ({ ...p, fullName: e.target.value })); setAddressErrors(p => ({ ...p, fullName: false })); }} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none bg-white ${addressErrors.fullName ? "border-red-400" : "border-gray-200 focus:border-black"}`} />
                  {addressErrors.fullName && <p className="text-[10px] text-red-500 mt-1 ml-1">Full name is required</p>}
                </div>
                <div>
                  <input type="text" placeholder="Phone Number * (e.g. 09123456789)" value={address.phone} onChange={e => { setAddress(p => ({ ...p, phone: e.target.value })); setAddressErrors(p => ({ ...p, phone: false })); }} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none bg-white ${addressErrors.phone ? "border-red-400" : "border-gray-200 focus:border-black"}`} />
                  {addressErrors.phone && <p className="text-[10px] text-red-500 mt-1 ml-1">{address.phone ? "Must be 11 digits starting with 09" : "Phone number is required"}</p>}
                </div>
                <div>
                  <input type="text" placeholder="Street Address *" value={address.address} onChange={e => { setAddress(p => ({ ...p, address: e.target.value })); setAddressErrors(p => ({ ...p, address: false })); }} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none bg-white ${addressErrors.address ? "border-red-400" : "border-gray-200 focus:border-black"}`} />
                  {addressErrors.address && <p className="text-[10px] text-red-500 mt-1 ml-1">Street address is required</p>}
                </div>
                <div>
                  <input type="text" placeholder="City *" value={address.city} onChange={e => { setAddress(p => ({ ...p, city: e.target.value })); setAddressErrors(p => ({ ...p, city: false })); }} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none bg-white ${addressErrors.city ? "border-red-400" : "border-gray-200 focus:border-black"}`} />
                  {addressErrors.city && <p className="text-[10px] text-red-500 mt-1 ml-1">City is required</p>}
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <p className="text-xs tracking-widest uppercase text-gray-400 font-medium mb-4">Payment Method</p>
              <div className="flex gap-3">
                <button onClick={() => setPaymentMethod("gcash")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition ${paymentMethod === "gcash" ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400"}`}>
                  <FiSmartphone /> GCash
                </button>
                <button onClick={() => setPaymentMethod("cod")} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border text-sm font-semibold transition ${paymentMethod === "cod" ? "bg-black text-white border-black" : "bg-white text-gray-600 border-gray-200 hover:border-black"}`}>
                  <FiPackage /> COD
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
                        <button onClick={() => { setGcashProof(null); setGcashProofPreview(null); }} className="absolute top-1 right-1 w-6 h-6 bg-white rounded-full shadow flex items-center justify-center hover:bg-red-50">
                          <FiX className="text-red-400 text-xs" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-blue-200 rounded-xl cursor-pointer hover:border-blue-400 transition bg-white">
                        <FiSmartphone className="text-blue-300 text-xl mb-1" />
                        <span className="text-[10px] text-blue-400">Click to upload screenshot</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (!file) return; setGcashProof(file); setGcashProofPreview(URL.createObjectURL(file)); }} />
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
          </div>

          {/* RIGHT — ORDER SUMMARY */}
          <div className="w-full md:w-80 shrink-0">
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-6">
              <p className="text-xs tracking-widest uppercase text-gray-400 font-medium mb-4">Order Summary</p>

              {item && (
                <div className="flex gap-3 mb-5 pb-5 border-b border-gray-100">
                  <img src={item.img} alt={item.name} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Size: {item.size}</p>
                    <p className="text-sm font-bold text-gray-800 mt-1">₱{item.price.toLocaleString()}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-500"><span>Subtotal</span><span>₱{subtotal.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping</span><span>₱{shipping.toLocaleString()}</span></div>
              </div>
              <div className="flex justify-between font-bold text-gray-800 text-base pt-3 border-t border-gray-100 mb-6">
                <span>Total</span><span>₱{total.toLocaleString()}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={placing}
                className="w-full bg-black text-white py-4 text-sm font-bold tracking-widest uppercase hover:bg-gray-800 transition flex items-center justify-center gap-3 rounded-xl disabled:opacity-60"
              >
                {placing ? "Placing Order..." : <> Place Order <FiArrowRight /></>}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
