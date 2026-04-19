import { CartItem } from "@/lib/cart";
import { supabase } from "@/lib/supabase";

export const ADMIN_EMAIL = "chayfashion.admin@gmail.com";

export const isAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.email === ADMIN_EMAIL;
};

export type Order = {
  orderNumber: string;
  userId?: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  date: string;
  expectedDelivery: string;
  delivered: boolean;
  paymentMethod?: string;
};

export const getOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((o) => ({
    orderNumber: o.order_number,
    userId: o.user_id,
    items: o.items,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    date: o.date,
    expectedDelivery: o.expected_delivery,
    delivered: o.delivered,
    paymentMethod: o.payment_method,
  }));
};

export const getAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((o) => ({
    orderNumber: o.order_number,
    userId: o.user_id,
    items: o.items,
    subtotal: o.subtotal,
    shipping: o.shipping,
    total: o.total,
    date: o.date,
    expectedDelivery: o.expected_delivery,
    delivered: o.delivered,
    paymentMethod: o.payment_method,
  }));
};

export const saveOrder = async (order: Order, userId: string) => {
  await supabase.from("orders").insert({
    user_id: userId,
    order_number: order.orderNumber,
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    date: order.date,
    expected_delivery: order.expectedDelivery,
    delivered: false,
    payment_method: order.paymentMethod ?? "cod",
  });
};

export const markAsDelivered = async (orderNumber: string) => {
  await supabase.from("orders").update({ delivered: true }).eq("order_number", orderNumber);
};

export const clearCart = (userId?: string) => {
  const key = userId ? `chay_cart_${userId}` : "chay_cart_guest";
  localStorage.setItem(key, "[]");
};
