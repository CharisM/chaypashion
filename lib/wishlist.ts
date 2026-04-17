import { Product } from "./products";

export type { Product };

const KEY = "chay_wishlist";

export const getWishlist = (): Product[] => {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(KEY) ?? "[]"); } catch { return []; }
};

export const addToWishlist = (item: Product) => {
  const list = getWishlist();
  if (!list.find(p => p.id === item.id))
    localStorage.setItem(KEY, JSON.stringify([...list, item]));
};

export const removeFromWishlist = (id: number) => {
  const list = getWishlist().filter(p => p.id !== id);
  localStorage.setItem(KEY, JSON.stringify(list));
};

export const isInWishlist = (id: number): boolean => {
  return getWishlist().some(p => p.id === id);
};
