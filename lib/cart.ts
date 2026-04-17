export type CartItem = {
  id: number;
  name: string;
  img: string;
  price: number;
  size: string;
  category: string;
};

const KEY = "chay_cart";

export const getCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
};

export const addToCart = (item: CartItem) => {
  const cart = getCart();
  localStorage.setItem(KEY, JSON.stringify([...cart, item]));
};

export const removeFromCart = (index: number) => {
  const cart = getCart();
  cart.splice(index, 1);
  localStorage.setItem(KEY, JSON.stringify(cart));
};

export const updateCartItem = (index: number, updated: Partial<CartItem>) => {
  const cart = getCart();
  cart[index] = { ...cart[index], ...updated };
  localStorage.setItem(KEY, JSON.stringify(cart));
};
