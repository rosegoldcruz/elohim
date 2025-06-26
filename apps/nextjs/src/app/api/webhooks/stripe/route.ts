import { NextResponse, type NextRequest } from "next/server";

import { handleEvent, stripe, type Stripe } from "@aeon/stripe";

import { env } from "~/env.mjs";

// Force dynamic rendering to avoid build-time database connection
export const dynamic = 'force-dynamic';

const handler = async (req: NextRequest) => {
  // Skip webhook processing during build
  if (process.env.NODE_ENV === 'production' && !env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Webhook not configured" }, { status: 400 });
  }

  const payload = await req.text();
  const signature = req.headers.get("Stripe-Signature")!;
  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      env.STRIPE_WEBHOOK_SECRET!,
    ) as Stripe.DiscriminatedEvent;
    await handleEvent(event);

    console.log("✅ Handled Stripe Event", event.type);
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.log(`❌ Error when handling Stripe Event: ${message}`);
    return NextResponse.json({ error: message }, { status: 400 });
  }
};

export { handler as GET, handler as POST };
