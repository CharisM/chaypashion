import { supabase } from "@/lib/supabase";

export type Review = {
  id: string;
  productId: number;
  userId: string;
  username: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export const getReviews = async (productId: number): Promise<Review[]> => {
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data.map((r) => ({
    id: r.id,
    productId: r.product_id,
    userId: r.user_id,
    username: r.username,
    rating: r.rating,
    comment: r.comment,
    createdAt: r.created_at,
  }));
};

export const submitReview = async (
  productId: number,
  userId: string,
  username: string,
  rating: number,
  comment: string
): Promise<{ error: string | null }> => {
  // check if user already reviewed this product
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("product_id", productId)
    .eq("user_id", userId)
    .single();
  if (existing) return { error: "You have already reviewed this product." };

  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    user_id: userId,
    username,
    rating,
    comment,
  });
  return { error: error?.message ?? null };
};

export const getAverageRating = (reviews: Review[]) => {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
};
