import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  const { email, orderNumber, items, subtotal, shipping, total, paymentMethod, deliveryAddress } = await req.json();

  const itemRows = items.map((item: any) => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;">
        <strong>${item.name}</strong><br/>
        <span style="color:#999;font-size:12px;">Size: ${item.size}${item.qty > 1 ? ` &times;${item.qty}` : ""}</span>
      </td>
      <td style="padding:8px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:bold;color:#c9a98a;">
        &#8369;${(item.price * (item.qty ?? 1)).toLocaleString()}
      </td>
    </tr>
  `).join("");

  const addressBlock = deliveryAddress ? `
    <div style="background:#faf9f7;border-radius:12px;padding:16px;margin-bottom:20px;">
      <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;">Delivery Address</p>
      <p style="margin:0;font-size:14px;color:#333;">
        <strong>${deliveryAddress.fullName}</strong><br/>
        ${deliveryAddress.phone}<br/>
        ${deliveryAddress.address}<br/>
        ${deliveryAddress.city}${deliveryAddress.zip ? `, ${deliveryAddress.zip}` : ""}
      </p>
    </div>
  ` : "";

  const { error } = await resend.emails.send({
    from: "Chay Fashion <onboarding@resend.dev>",
    to: email,
    subject: `Order Confirmed – #${orderNumber}`,
    html: `
      <div style="font-family:sans-serif;max-width:560px;margin:0 auto;color:#333;">
        <div style="background:#000;padding:24px 32px;">
          <h1 style="color:#fff;font-size:24px;font-style:italic;margin:0;">Chay Fashion</h1>
        </div>
        <div style="padding:32px;">
          <h2 style="font-size:22px;margin-bottom:4px;">Order Confirmed! 🎉</h2>
          <p style="color:#666;font-size:14px;">Thank you for shopping with us.</p>
          <div style="background:#000;color:#fff;display:inline-block;padding:6px 16px;border-radius:999px;font-size:12px;letter-spacing:2px;text-transform:uppercase;margin-bottom:24px;">
            Order #${orderNumber}
          </div>

          ${addressBlock}

          <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
            ${itemRows}
          </table>

          <div style="border-top:2px solid #000;padding-top:12px;space-y:4px;">
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:4px;">
              <span>Subtotal</span><span>&#8369;${subtotal.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:13px;color:#666;margin-bottom:8px;">
              <span>Shipping</span><span>&#8369;${shipping.toLocaleString()}</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:16px;font-weight:bold;">
              <span>Total</span><span>&#8369;${total.toLocaleString()}</span>
            </div>
          </div>

          <div style="margin-top:24px;background:#faf9f7;border-radius:12px;padding:16px;font-size:13px;color:#666;">
            <p style="margin:0 0 6px;">📦 Ships within <strong style="color:#000;">1–2 business days</strong></p>
            <p style="margin:0 0 6px;">🚚 Estimated delivery: <strong style="color:#000;">3–5 business days</strong></p>
            <p style="margin:0;">💳 Payment: <strong style="color:#000;">${paymentMethod === "gcash" ? "GCash" : "Cash on Delivery"}</strong></p>
          </div>
        </div>
        <div style="background:#f5f5f5;padding:16px 32px;text-align:center;font-size:11px;color:#999;">
          © 2026 Chay Fashion. All rights reserved.
        </div>
      </div>
    `,
  });

  if (error) return NextResponse.json({ error }, { status: 500 });
  return NextResponse.json({ success: true });
}
