import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";
import { isRateLimited } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  if (isRateLimited(ip, 10, 60_000))
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY === "<your_resend_api_key>") {
    console.warn("RESEND_API_KEY not configured — skipping email.");
    return NextResponse.json({ success: true, skipped: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { email, customerName, orderNumber, total, status, reason } = await req.json();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const isApproved = status === "approved";

  const { data, error } = await resend.emails.send({
    from: "Chay Fashion <onboarding@resend.dev>",
    to: email,
    subject: `${isApproved ? "✅ Refund Approved" : "❌ Refund Rejected"} – Order #${orderNumber}`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:580px;margin:0 auto;color:#333;background:#fff;">

        <!-- HEADER -->
        <div style="background:#000;padding:24px 32px;">
          <h1 style="color:#fff;font-size:26px;font-style:italic;margin:0;">Chay Fashion</h1>
        </div>

        <!-- BODY -->
        <div style="padding:32px;">
          <div style="text-align:center;margin-bottom:24px;">
            <div style="font-size:48px;margin-bottom:12px;">${isApproved ? "✅" : "❌"}</div>
            <h2 style="font-size:22px;margin:0 0 8px;">Refund ${isApproved ? "Approved" : "Rejected"}</h2>
            <p style="color:#666;font-size:14px;margin:0;">
              ${isApproved
                ? "Your refund request has been approved. We will process your refund shortly."
                : "Unfortunately, your refund request has been reviewed and could not be approved at this time."}
            </p>
          </div>

          <!-- ORDER DETAILS -->
          <div style="background:#f5f5f5;border-radius:12px;padding:16px;text-align:center;margin-bottom:20px;">
            <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;">Order Number</p>
            <p style="margin:0;font-size:18px;font-weight:bold;color:#000;">#${orderNumber}</p>
            <p style="margin:4px 0 0;font-size:13px;color:#666;">Total: <strong>&#8369;${Number(total).toLocaleString()}</strong></p>
          </div>

          <!-- REASON -->
          ${reason ? `
          <div style="background:#faf9f7;border-radius:12px;padding:16px;margin-bottom:20px;">
            <p style="margin:0 0 6px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;">Your Reason</p>
            <p style="margin:0;font-size:14px;color:#555;font-style:italic;">"${reason}"</p>
          </div>
          ` : ""}

          <!-- STATUS BAR -->
          <div style="border-left:4px solid ${isApproved ? "#22c55e" : "#ef4444"};padding:12px 16px;background:#fafafa;border-radius:0 8px 8px 0;margin-bottom:24px;">
            <p style="margin:0;font-size:13px;color:#555;">
              ${isApproved
                ? "Our team will reach out to you regarding the refund process. Please allow <strong>3–5 business days</strong> for processing."
                : "If you believe this decision was made in error or need further assistance, please contact our support team."}
            </p>
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
    console.error("Resend refund email error:", error);
    return NextResponse.json({ error }, { status: 500 });
  }

  return NextResponse.json({ success: true, id: data?.id });
}
