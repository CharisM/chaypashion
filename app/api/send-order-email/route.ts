import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";


type EmailOrderItem = {
  name: string;
  size: string;
  qty?: number;
  price: number;
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip, 5, 60_000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "<your_resend_api_key>") {
    console.warn("RESEND_API_KEY not configured — skipping email.");
    return NextResponse.json({ success: true, skipped: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  const { email, orderNumber, items, subtotal, shipping, total, paymentMethod, deliveryAddress } = await req.json();

  const itemRows = (items as EmailOrderItem[]).map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;vertical-align:middle;">
        <strong style="font-size:14px;color:#333;">${item.name}</strong><br/>
        <span style="color:#999;font-size:12px;">Size: ${item.size}${(item.qty ?? 1) > 1 ? ` &times;${item.qty}` : ""}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;vertical-align:middle;font-weight:bold;color:#c9a98a;font-size:14px;">
        &#8369;${(item.price * (item.qty ?? 1)).toLocaleString()}
      </td>
    </tr>
  `).join("");

  const addressBlock = deliveryAddress ? `
    <div style="background:#faf9f7;border-radius:12px;padding:16px;margin-bottom:24px;">
      <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;">Delivery Address</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
        <strong>${deliveryAddress.fullName}</strong><br/>
        ${deliveryAddress.phone}<br/>
        ${deliveryAddress.address}<br/>
        ${deliveryAddress.city}${deliveryAddress.zip ? `, ${deliveryAddress.zip}` : ""}
      </p>
    </div>
  ` : "";

  const paymentBlock = paymentMethod === "gcash" ? `
    <div style="background:#eff6ff;border-radius:12px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#3b82f6;">
        📱 <strong>GCash Payment</strong> — Please send payment to <strong>0933-699-5665</strong> and wait for verification.
      </p>
    </div>
  ` : `
    <div style="background:#f5f5f5;border-radius:12px;padding:14px 16px;margin-bottom:24px;">
      <p style="margin:0;font-size:13px;color:#555;">
        📦 <strong>Cash on Delivery</strong> — Pay when your order arrives at your doorstep.
      </p>
    </div>
  `;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const { data, error } = await resend.emails.send({
    from: "Chay Fashion <onboarding@resend.dev>",
    to: email,
    subject: `🎉 Order Confirmed – #${orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#333;background:#fff;">

        <!-- HEADER -->
        <div style="background:#000;padding:24px 32px;">
          <h1 style="color:#fff;font-size:26px;font-style:italic;margin:0;">Chay Fashion</h1>
        </div>

        <!-- BODY -->
        <div style="padding:32px;">
          <h2 style="font-size:22px;margin:0 0 6px;">Order Confirmed! 🎉</h2>
          <p style="color:#666;font-size:14px;margin:0 0 20px;">Thank you for shopping with us, your order is being prepared.</p>

          <div style="background:#000;color:#fff;display:inline-block;padding:6px 18px;border-radius:999px;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px;">
            Order #${orderNumber}
          </div>

          ${paymentBlock}
          ${addressBlock}

          <!-- ITEMS -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
            <thead>
              <tr>
                <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;padding-bottom:8px;border-bottom:2px solid #000;">Item</th>
                <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;padding-bottom:8px;border-bottom:2px solid #000;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <!-- TOTALS — table layout for email client compatibility -->
          <table style="width:100%;border-collapse:collapse;margin-bottom:24px;">
            <tr>
              <td style="font-size:13px;color:#666;padding:4px 0;">Subtotal</td>
              <td style="font-size:13px;color:#666;padding:4px 0;text-align:right;">&#8369;${subtotal.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="font-size:13px;color:#666;padding:4px 0;">Shipping</td>
              <td style="font-size:13px;color:#666;padding:4px 0;text-align:right;">&#8369;${shipping.toLocaleString()}</td>
            </tr>
            <tr style="border-top:2px solid #000;">
              <td style="font-size:16px;font-weight:bold;color:#000;padding:10px 0 0;">Total</td>
              <td style="font-size:16px;font-weight:bold;color:#000;padding:10px 0 0;text-align:right;">&#8369;${total.toLocaleString()}</td>
            </tr>
          </table>

          <!-- INFO BOX -->
          <div style="background:#faf9f7;border-radius:12px;padding:16px;font-size:13px;color:#666;margin-bottom:24px;">
            <p style="margin:0 0 6px;">📦 Ships within <strong style="color:#000;">1–2 business days</strong></p>
            <p style="margin:0 0 6px;">🚚 Estimated delivery: <strong style="color:#000;">3–5 business days</strong></p>
            <p style="margin:0;">📩 You'll receive updates when your order status changes.</p>
          </div>

          <!-- CTA -->
          <div style="text-align:center;">
            <a href="${siteUrl}/orders"
              style="display:inline-block;background:#000;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:1px;">
              View My Orders
            </a>
          </div>
        </div>

        <!-- FOOTER -->
        <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:11px;color:#999;">
          © 2026 Chay Fashion. All rights reserved.<br/>
          <a href="${siteUrl}" style="color:#999;text-decoration:none;">chayfashion.com</a>
        </div>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data?.id });
}
