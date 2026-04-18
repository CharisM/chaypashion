// Add your admin email here
export const ADMIN_EMAIL = "chayfashion.admin@gmail.com";

export const isAdmin = (email: string | null) => email === ADMIN_EMAIL;

export type Order = {
  orderNumber: string;
  items: CartItem[];
  subtotal: number;
  shipping: number;
  total: number;
  date: string;
  expectedDelivery: string;
  delivered: boolean;
};

const KEY = "chay_orders";

export const getOrders = (): Order[] => {
  if (typeof window === "undefined") return [];
  try {
    const all = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return all.filter((o: Order) => o.items && o.items.length > 0 && o.total > 0);
  } catch { return []; }
};

export const saveOrder = (order: Order) => {
  if (!order.items || order.items.length === 0) return;
  const orders = getOrders();
  localStorage.setItem(KEY, JSON.stringify([order, ...orders]));
};

export const markAsDelivered = (orderNumber: string) => {
  const all = JSON.parse(localStorage.getItem(KEY) ?? "[]");
  const updated = all.map((o: Order) =>
    o.orderNumber === orderNumber ? { ...o, delivered: true } : o
  );
  localStorage.setItem(KEY, JSON.stringify(updated));
};

export const clearCart = (userId?: string) => {
  const key = userId ? `chay_cart_${userId}` : "chay_cart_guest";
  localStorage.setItem(key, "[]");
};
