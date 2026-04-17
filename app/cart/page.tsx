"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { FiShoppingBag, FiTrash2, FiArrowLeft, FiEdit2, FiCheck, FiX } from "react-icons/fi";
import Link from "next/link";
import { getCart, removeFromCart, updateCartItem, CartItem } from "@/lib/cart";
import { products } from "@/lib/products";

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editSize, setEditSize] = useState<string>("");

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setTimeout(() => router.push("/login"), 0); return; }
    };
    check();
    setCart(getCart());
  }, []);

  const handleRemove = (index: number) => {
    removeFromCart(index);
    setCart(getCart());
    if (editingIndex === index) setEditingIndex(null);
  };

  const handleEdit = (index: number) => {
    setEditingIndex(index);
    setEditSize(cart[index].size);
  };

  const handleSave = (index: number) => {
    updateCartItem(index, { size: editSize });
    setCart(getCart());
    setEditingIndex(null);
  };

  const getSizes = (itemId: number) => products.find((p) => p.id === itemId)?.sizes ?? [];

  const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
  const shipping = cart.length > 0 ? 150 : 0;
  const total = subtotal + shipping;

  return (
    <div className="min-h-screen bg-[#faf7f4]">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-12 py-5 bg-white border-b border-[#e8e0d8]">
        <Link href="/" className="text-3xl font-serif italic text-[#2c2c2c]">Chay Fashion</Link>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-[#9a8c82] hover:text-[#2c2c2c] transition"
        >
          <FiArrowLeft /> Back
        </button>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-14">

        {/* HEADER */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-xs tracking-[0.4em] text-[#b5a99f] uppercase mb-1">Your Selection</p>
            <h1 className="text-4xl font-bold tracking-tight text-[#2c2c2c]">Shopping Cart</h1>
          </div>
          {cart.length > 0 && (
            <span className="text-sm text-[#9a8c82]">{cart.length} item{cart.length !== 1 ? "s" : ""}</span>
          )}
        </div>

        {cart.length === 0 ? (

          /* EMPTY STATE */
          <div className="bg-white border border-[#e8e0d8] rounded-3xl flex flex-col items-center justify-center py-32 gap-5">
            <div className="w-20 h-20 rounded-full bg-[#f5ede6] flex items-center justify-center">
              <FiShoppingBag className="text-3xl text-[#c9a98a]" />
            </div>
            <div className="text-center">
              <p className="text-[#2c2c2c] font-semibold text-lg">Your cart is empty</p>
              <p className="text-[#9a8c82] text-sm mt-1">Looks like you haven't added anything yet.</p>
            </div>
            <Link
              href="/"
              className="mt-2 bg-[#c9a98a] text-white text-xs px-10 py-3 tracking-[0.3em] uppercase hover:bg-[#b8957a] transition rounded-full"
            >
              Explore Collection
            </Link>
          </div>

        ) : (
          <div className="grid grid-cols-5 gap-8 items-start">

            {/* ITEMS LIST */}
            <div className="col-span-3 space-y-4">
              {cart.map((item, index) => {
                const isEditing = editingIndex === index;
                const sizes = getSizes(item.id);
                return (
                  <div
                    key={index}
                    className="group bg-white border border-[#e8e0d8] rounded-2xl overflow-hidden flex hover:shadow-md hover:border-[#c9a98a] transition duration-300"
                  >
                    {/* IMAGE */}
                    <div className="w-32 shrink-0 overflow-hidden">
                      <img
                        src={item.img}
                        alt={item.name}
                        className="w-full h-full object-cover min-h-[148px] group-hover:scale-105 transition duration-500"
                      />
                    </div>

                    {/* DETAILS */}
                    <div className="flex-1 px-5 py-4 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] tracking-[0.3em] text-[#c9a98a] uppercase font-medium">{item.category}</span>
                        <p className="text-sm font-semibold mt-0.5 text-[#2c2c2c]">{item.name}</p>

                        {isEditing ? (
                          <div className="mt-3">
                            <p className="text-[10px] tracking-widest text-[#9a8c82] uppercase mb-2">Change Size</p>
                            <div className="flex gap-2 flex-wrap">
                              {sizes.map((s) => (
                                <button
                                  key={s}
                                  onClick={() => setEditSize(s)}
                                  className={`w-9 h-9 text-xs font-medium border rounded transition ${
                                    editSize === s
                                      ? "bg-[#c9a98a] text-white border-[#c9a98a]"
                                      : "bg-white text-[#2c2c2c] border-[#e8e0d8] hover:border-[#c9a98a] hover:text-[#c9a98a]"
                                  }`}
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] tracking-widest text-[#9a8c82] uppercase">Size</span>
                            <span className="text-xs font-bold bg-[#f5ede6] text-[#c9a98a] px-2 py-0.5 rounded">{item.size}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-base font-bold text-[#2c2c2c] mt-3">₱{item.price.toLocaleString()}</p>
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-col justify-between items-end px-4 py-4">
                      <button
                        onClick={() => handleRemove(index)}
                        className="text-[#d4b8ae] hover:text-red-400 transition"
                        title="Remove"
                      >
                        <FiX className="text-lg" />
                      </button>

                      {isEditing ? (
                        <button
                          onClick={() => handleSave(index)}
                          className="flex items-center gap-1 text-xs text-white bg-[#c9a98a] hover:bg-[#b8957a] transition px-3 py-1.5 rounded-full"
                        >
                          <FiCheck /> Save
                        </button>
                      ) : (
                        <button
                          onClick={() => handleEdit(index)}
                          className="flex items-center gap-1 text-xs text-[#9a8c82] hover:text-[#c9a98a] transition border border-[#e8e0d8] hover:border-[#c9a98a] px-3 py-1.5 rounded-full"
                        >
                          <FiEdit2 /> Edit
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ORDER SUMMARY */}
            <div className="col-span-2 bg-white border border-[#e8e0d8] rounded-2xl p-7 sticky top-6">

              <p className="text-[10px] tracking-[0.4em] uppercase text-[#b5a99f] mb-6">Order Summary</p>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between text-[#9a8c82]">
                  <span>Subtotal</span>
                  <span>₱{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#9a8c82]">
                  <span>Shipping</span>
                  <span>₱{shipping.toLocaleString()}</span>
                </div>
              </div>

              <div className="my-5 border-t border-[#e8e0d8]" />

              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-[#2c2c2c]">Total</span>
                <span className="text-xl font-bold text-[#2c2c2c]">₱{total.toLocaleString()}</span>
              </div>

              <button className="mt-8 w-full bg-[#c9a98a] text-white py-4 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#b8957a] transition rounded-xl">
                Proceed to Checkout
              </button>

              <Link
                href="/"
                className="block text-center mt-4 text-xs text-[#b5a99f] hover:text-[#c9a98a] transition tracking-widest uppercase"
              >
                Continue Shopping
              </Link>

              <div className="mt-8 pt-5 border-t border-[#f0e8e0] flex items-center gap-3">
                <div className="h-px flex-1 bg-[#f0e8e0]" />
                <span className="text-[10px] tracking-widest text-[#c9b8ae] uppercase font-serif italic">Chay Fashion</span>
                <div className="h-px flex-1 bg-[#f0e8e0]" />
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
