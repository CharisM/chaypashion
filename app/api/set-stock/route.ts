import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const { productId, quantity } = await req.json();
  if (productId === undefined || quantity === undefined)
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  const { error } = await adminSupabase
    .from("stock")
    .upsert({ product_id: productId, quantity });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
