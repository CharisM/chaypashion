import { supabase } from "@/lib/supabase";
import { Product, products } from "./products";

export type { Product };

export const getWishlist = async (userId: string): Promise<Product[]> => {
  const { data } = await supabase.from("wishlists").select("product_id").eq("user_id", userId);
  if (!data) return [];
  return data.map(row => products.find(p => p.id === row.product_id)).filter(Boolean) as Product[];
};

export const addToWishlist = async (userId: string, productId: number) => {
  await supabase.from("wishlists").upsert({ user_id: userId, product_id: productId });
};

export const removeFromWishlist = async (userId: string, productId: number) => {
  await supabase.from("wishlists").delete().eq("user_id", userId).eq("product_id", productId);
};

export const isInWishlist = async (userId: string, productId: number): Promise<boolean> => {
  const { data } = await supabase.from("wishlists").select("id").eq("user_id", userId).eq("product_id", productId).single();
  return !!data;
};
