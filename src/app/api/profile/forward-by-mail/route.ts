import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { ForwardProfileEmail } from "@/emails/forward-profile-email";
import { createClient } from "@/lib/supabase/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { recipientName, recipientEmail, customMessage, profileId, senderName } =
      await request.json();

    if (!recipientName?.trim() || !recipientEmail?.trim() || !profileId || !senderName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { error } = await resend.emails.send({
      from: "Anugraha Matrimony <noreply@anugrahamatrimony.com>",
      to: recipientEmail.trim(),
      subject: `${senderName} shared a profile with you on Anugraha Matrimony`,
      react: ForwardProfileEmail({
        senderName,
        recipientName: recipientName.trim(),
        profileId,
        customMessage: customMessage?.trim() || undefined,
      }),
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}
