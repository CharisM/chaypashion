"use client";

import { useEffect, useState } from "react";
import { getProductsFromSupabase, Product, products as fallbackProducts } from "@/lib/products";

export function useProducts() {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getProductsFromSupabase()
      .then((data) => {
        if (active) setProducts(data);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return { products, loading };
}
