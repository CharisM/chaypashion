import { NextRequest, NextResponse } from "next/server";
import { transporter, FROM } from "@/lib/mailer";

export async function POST(req: NextRequest) {
  const { toEmail, toName, originalMessage, replyText } = await req.json();
  if (!toEmail || !replyText) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

  try {
    await transporter.sendMail({
      from: FROM,
      to: toEmail,
      subject: "Reply from Chay Fashion",
      html: `
        <div style="font-family:sans-serif;max-width:560px;margin:auto">
          <h2 style="color:#111">Hi ${toName || "there"},</h2>
          <p style="color:#444;line-height:1.6">${replyText.replace(/\n/g, "<br/>")}</p>
          <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
          <p style="color:#999;font-size:12px">Your original message:<br/><em>${originalMessage}</em></p>
          <p style="color:#999;font-size:12px;margin-top:24px">— Chay Fashion Support</p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
