import { supabase } from "@/lib/supabase";

export type StockMap = Record<number, number>;
export const LOW_STOCK_THRESHOLD = 3;

export const getStockMap = async (): Promise<StockMap> => {
  const { data } = await supabase.from("stock").select("product_id, quantity");
  if (!data) return {};
  return Object.fromEntries(data.map((s) => [s.product_id, s.quantity]));
};

export const getStock = async (productId: number): Promise<number> => {
  const { data } = await supabase.from("stock").select("quantity").eq("product_id", productId).single();
  return data?.quantity ?? 0;
};

export const deductStock = async (productId: number, qty: number = 1): Promise<{ error: string | null }> => {
  const current = await getStock(productId);
  const newQty = Math.max(0, current - qty);
  const { error } = await supabase.from("stock").update({ quantity: newQty }).eq("product_id", productId);
  return { error: error?.message ?? null };
};

export const setStock = async (productId: number, quantity: number): Promise<{ error: string | null }> => {
  const { error } = await supabase.from("stock").upsert({ product_id: productId, quantity });
  return { error: error?.message ?? null };
};
