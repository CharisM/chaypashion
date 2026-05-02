import { CartItem } from "@/lib/cart";
import { supabase } from "@/lib/supabase";
import { getStock } from "@/lib/stock";

export const ADMIN_EMAILS = ["miercharis@gmail.com"];
export const ADMIN_EMAIL = ADMIN_EMAILS[0]; // kept for backward compat

export const isAdmin = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  return !!user?.email && ADMIN_EMAILS.includes(user.email);
};

export type OrderStatus = "pending" | "processing" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "unpaid" | "paid";

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
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  gcashProofUrl?: string;
};

const mapOrder = (o: any): Order => ({
  orderNumber: o.order_number,
  userId: o.user_id,
  items: o.items,
  subtotal: o.subtotal,
  shipping: o.shipping,
  total: o.total,
  date: o.date,
  expectedDelivery: o.expected_delivery,
  delivered: o.delivered,
  status: o.status ?? "pending",
  paymentStatus: o.payment_status ?? "unpaid",
  paymentMethod: o.payment_method,
  customerName: o.customer_name,
  customerPhone: o.customer_phone,
  customerAddress: o.customer_address,
  gcashProofUrl: o.gcash_proof_url,
});

export const getOrders = async (userId: string): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapOrder);
};

export const getAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(mapOrder);
};

export const saveOrder = async (order: Order, userId: string): Promise<{ error: string | null }> => {
  const { error } = await supabase.from("orders").insert({
    user_id: userId,
    order_number: order.orderNumber,
    items: order.items,
    subtotal: order.subtotal,
    shipping: order.shipping,
    total: order.total,
    date: order.date,
    expected_delivery: order.expectedDelivery,
    delivered: false,
    status: "pending",
    payment_status: order.paymentMethod === "gcash" ? "unpaid" : "paid",
    payment_method: order.paymentMethod ?? "cod",
    customer_name: order.customerName,
    customer_phone: order.customerPhone,
    customer_address: order.customerAddress,
    gcash_proof_url: order.gcashProofUrl ?? null,
  });
  return { error: error?.message ?? null };
};

export const updateOrderStatus = async (orderNumber: string, status: OrderStatus): Promise<{ error: string | null }> => {
  const delivered = status === "delivered";
  const { error } = await supabase.from("orders").update({ status, delivered }).eq("order_number", orderNumber);
  return { error: error?.message ?? null };
};

export const updatePaymentStatus = async (orderNumber: string, paymentStatus: PaymentStatus): Promise<{ error: string | null }> => {
  const { error } = await supabase.from("orders").update({ payment_status: paymentStatus }).eq("order_number", orderNumber);
  return { error: error?.message ?? null };
};

export const cancelOrder = async (orderNumber: string): Promise<{ error: string | null }> => {
  // fetch order items before cancelling to restore stock
  const { data } = await supabase.from("orders").select("items, status").eq("order_number", orderNumber).single();
  // only restore stock if order was not already cancelled
  if (data && data.status !== "cancelled") {
    const items: CartItem[] = data.items ?? [];
    await Promise.all(items.map(async (item) => {
      const current = await getStock(item.id);
      await supabase.from("stock").update({ quantity: current + (item.qty ?? 1) }).eq("product_id", item.id);
    }));
  }
  const { error } = await supabase.from("orders").update({ status: "cancelled", delivered: false }).eq("order_number", orderNumber);
  return { error: error?.message ?? null };
};

export const markAsDelivered = async (orderNumber: string): Promise<{ error: string | null }> => {
  const { error } = await supabase.from("orders").update({ delivered: true, status: "delivered" }).eq("order_number", orderNumber);
  return { error: error?.message ?? null };
};

export const clearCart = (userId?: string) => {
  const key = userId ? `chay_cart_${userId}` : "chay_cart_guest";
  localStorage.setItem(key, "[]");
};

export type RefundStatus = "pending" | "approved" | "rejected";

export type RefundRequest = {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  reason: string;
  status: RefundStatus;
  createdAt: string;
  total: number;
  paymentMethod: string;
};

export const submitRefundRequest = async (
  orderNumber: string,
  userId: string,
  customerName: string,
  reason: string,
  total: number,
  paymentMethod: string
): Promise<{ error: string | null }> => {
  const { data: existing } = await supabase
    .from("refund_requests")
    .select("id")
    .eq("order_number", orderNumber)
    .single();
  if (existing) return { error: "A refund request for this order already exists." };
  const { error } = await supabase.from("refund_requests").insert({
    order_number: orderNumber,
    user_id: userId,
    customer_name: customerName,
    reason,
    status: "pending",
    total,
    payment_method: paymentMethod,
  });
  return { error: error?.message ?? null };
};

export const getAllRefundRequests = async (): Promise<RefundRequest[]> => {
  const { data, error } = await supabase
    .from("refund_requests")
    .select("*")
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(r => ({
    id: r.id,
    orderNumber: r.order_number,
    userId: r.user_id,
    customerName: r.customer_name,
    reason: r.reason,
    status: r.status,
    createdAt: r.created_at,
    total: r.total,
    paymentMethod: r.payment_method,
  }));
};

export const updateRefundStatus = async (id: string, status: RefundStatus) => {
  await supabase.from("refund_requests").update({ status }).eq("id", id);
};

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export const saveContactMessage = async (name: string, email: string, message: string): Promise<{ error: string | null }> => {
  const { error } = await supabase.from("contact_messages").insert({ name, email, message, read: false });
  return { error: error?.message ?? null };
};

export const getAllContactMessages = async (): Promise<ContactMessage[]> => {
  const { data, error } = await supabase.from("contact_messages").select("*").order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map(m => ({ id: m.id, name: m.name, email: m.email, message: m.message, read: m.read, createdAt: m.created_at }));
};

export const markMessageRead = async (id: string): Promise<void> => {
  await supabase.from("contact_messages").update({ read: true }).eq("id", id);
};
