export type CartItem = {
  id: number;
  name: string;
  img: string;
  price: number;
  size: string;
  category: string;
  qty?: number;
};

const getKey = (userId?: string) => userId ? `chay_cart_${userId}` : "chay_cart_guest";

export const getCart = (userId?: string): CartItem[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(getKey(userId)) ?? "[]"); } catch { return []; }
};

export const addToCart = (item: CartItem, userId?: string) => {
  const cart = getCart(userId);
  localStorage.setItem(getKey(userId), JSON.stringify([...cart, item]));
};

export const removeFromCart = (index: number, userId?: string) => {
  const cart = getCart(userId);
  cart.splice(index, 1);
  localStorage.setItem(getKey(userId), JSON.stringify(cart));
};

export const updateCartItem = (index: number, updated: Partial<CartItem>, userId?: string) => {
  const cart = getCart(userId);
  cart[index] = { ...cart[index], ...updated };
  localStorage.setItem(getKey(userId), JSON.stringify(cart));
};

export const clearUserCart = (userId?: string) => {
  localStorage.setItem(getKey(userId), "[]");
};
