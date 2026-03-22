import { NextResponse } from "next/server";
import crypto from "crypto";
import { createServerClient } from "@supabase/ssr";

// Use service role for webhook since there's no user session
function createServiceClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    }
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const supabase = createServiceClient();

    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity;
        const orderId = payment.order_id;

        // Idempotent: check if already processed
        const { data: existing } = await supabase
          .from("transactions")
          .select("status")
          .eq("razorpay_order_id", orderId)
          .single();

        if (existing?.status === "success") {
          return NextResponse.json({ status: "already_processed" });
        }

        await supabase
          .from("transactions")
          .update({
            razorpay_payment_id: payment.id,
            payment_method: payment.method,
            status: "success",
            completed_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", orderId);

        break;
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity;
        await supabase
          .from("transactions")
          .update({
            razorpay_payment_id: payment.id,
            status: "failed",
            completed_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", payment.order_id);
        break;
      }

      case "refund.created": {
        const refund = event.payload.refund.entity;
        await supabase
          .from("transactions")
          .update({ status: "refunded" })
          .eq("razorpay_payment_id", refund.payment_id);
        break;
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
