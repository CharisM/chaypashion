import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";
import { transporter, FROM } from "@/lib/mailer";

type StatusEmailItem = {
  name: string;
  size: string;
  qty?: number;
  price: number;
};

const STATUS_INFO: Record<string, { emoji: string; label: string; message: string; color: string }> = {
  processing: {
    emoji: "🔄",
    label: "Order Processing",
    message: "Great news! Your order is now being processed and prepared for shipment.",
    color: "#3b82f6",
  },
  shipped: {
    emoji: "🚚",
    label: "Your Order Has Been Shipped!",
    message: "Your order is on its way! Expect delivery within 3–5 business days.",
    color: "#8b5cf6",
  },
  delivered: {
    emoji: "✅",
    label: "Order Delivered",
    message: "Your order has been delivered. We hope you love your purchase!",
    color: "#22c55e",
  },
  cancelled: {
    emoji: "❌",
    label: "Order Cancelled",
    message: "Your order has been cancelled. If you have questions, please contact us.",
    color: "#ef4444",
  },
};

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip, 10, 60_000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.warn("Gmail credentials not configured — skipping email.");
    return NextResponse.json({ success: true, skipped: true });
  }

  const { email, orderNumber, status, total, items, customerName, customerAddress, expectedDelivery } = await req.json();

  const info = STATUS_INFO[status];
  if (!info) return NextResponse.json({ error: "Unknown status" }, { status: 400 });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const itemsBlock = (status === "shipped" || status === "delivered") && items?.length ? `
    <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
      <thead>
        <tr>
          <th style="text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;padding-bottom:8px;border-bottom:2px solid #000;">Item</th>
          <th style="text-align:right;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;padding-bottom:8px;border-bottom:2px solid #000;">Price</th>
        </tr>
      </thead>
      <tbody>
        ${(items as StatusEmailItem[]).map((item) => `
          <tr>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;">
              <strong>${item.name}</strong><br/>
              <span style="color:#999;font-size:12px;">Size: ${item.size}${(item.qty ?? 1) > 1 ? ` &times;${item.qty}` : ""}</span>
            </td>
            <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;color:#c9a98a;font-size:14px;">
              &#8369;${(item.price * (item.qty ?? 1)).toLocaleString()}
            </td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  ` : "";

  const addressBlock = status === "shipped" && customerAddress ? `
    <div style="background:#faf9f7;border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;">Delivering To</p>
      <p style="margin:0;font-size:14px;color:#333;line-height:1.6;">
        <strong>${customerName ?? ""}</strong><br/>
        ${customerAddress}
      </p>
    </div>
  ` : "";

  const estimatedBlock = status === "shipped" ? `
    <div style="background:#f3f0ff;border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
      <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#8b5cf6;">Estimated Delivery</p>
      <p style="margin:0;font-size:16px;font-weight:bold;color:#000;">${expectedDelivery ?? "3–5 business days"}</p>
    </div>
  ` : "";

  const reviewBlock = status === "delivered" ? `
    <div style="background:#f0fdf4;border-radius:12px;padding:16px;margin-bottom:20px;text-align:center;">
      <p style="margin:0 0 8px;font-size:14px;color:#333;">Enjoying your purchase? Leave a review!</p>
      <a href="${siteUrl}/shop" style="display:inline-block;background:#22c55e;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:bold;">
        Write a Review
      </a>
    </div>
  ` : "";

  try {
    await transporter.sendMail({
      from: FROM,
      to: email,
      subject: `${info.emoji} ${info.label} – Order #${orderNumber}`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#333;background:#fff;">
          <div style="background:#000;padding:24px 32px;">
            <h1 style="color:#fff;font-size:26px;font-style:italic;margin:0;">Chay Fashion</h1>
          </div>
          <div style="padding:32px;">
            <div style="text-align:center;margin-bottom:24px;">
              <div style="font-size:48px;margin-bottom:12px;">${info.emoji}</div>
              <h2 style="font-size:22px;margin:0 0 8px;">${info.label}</h2>
              <p style="color:#666;font-size:14px;margin:0;">${info.message}</p>
            </div>
            <div style="background:#f5f5f5;border-radius:12px;padding:16px;text-align:center;margin-bottom:20px;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;">Order Number</p>
              <p style="margin:0;font-size:18px;font-weight:bold;color:#000;">#${orderNumber}</p>
              <p style="margin:4px 0 0;font-size:13px;color:#666;">Total: <strong>&#8369;${Number(total).toLocaleString()}</strong></p>
            </div>
            ${estimatedBlock}
            ${addressBlock}
            ${itemsBlock}
            ${reviewBlock}
            <div style="border-left:4px solid ${info.color};padding:12px 16px;background:#fafafa;border-radius:0 8px 8px 0;margin-bottom:24px;">
              <p style="margin:0;font-size:13px;color:#555;">
                Status updated to <strong style="color:${info.color};">${info.label}</strong>
              </p>
            </div>
            <div style="text-align:center;">
              <a href="${siteUrl}/orders" style="display:inline-block;background:#000;color:#fff;padding:14px 32px;border-radius:10px;text-decoration:none;font-size:13px;font-weight:bold;letter-spacing:1px;">
                View My Orders
              </a>
            </div>
          </div>
          <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:11px;color:#999;">
            © 2026 Chay Fashion. All rights reserved.
          </div>
        </div>
      `,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Nodemailer status email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
