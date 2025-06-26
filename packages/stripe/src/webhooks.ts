import type Stripe from "stripe";

import { stripe } from ".";
import { getSubscriptionPlan } from "./plans";

// Lazy-load database to avoid build-time connection issues
function getDb() {
  const { db } = require("@aeon/db");
  return db;
}

export async function handleEvent(event: Stripe.DiscriminatedEvent) {
  console.log(`🔄 Processing Stripe webhook: ${event.type}`);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    if (!session.subscription) {
      console.log("⚠️ No subscription found in checkout session");
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(
      session.subscription as string,
    );

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    const { userId } = subscription.metadata;
    if (!userId) {
      throw new Error("Missing userId in subscription metadata");
    }

    const priceId = subscription.items.data[0]?.price.id;
    if (!priceId) {
      throw new Error("Missing price ID in subscription");
    }

    const plan = getSubscriptionPlan(priceId);
    console.log(`📋 Mapping price ${priceId} to plan ${plan}`);

    const db = getDb();
    const customer = await db
      .selectFrom("Customer")
      .selectAll()
      .where("authUserId", "=", userId)
      .executeTakeFirst();

    if (customer) {
      await db
        .updateTable("Customer")
        .where("id", "=", customer.id)
        .set({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
          plan: plan,
        })
        .execute();

      console.log(`✅ Updated customer ${userId} with plan ${plan}`);
    } else {
      console.log(`⚠️ Customer not found for userId: ${userId}`);
    }
  }

  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice;

    if (!invoice.subscription) {
      console.log("⚠️ No subscription found in invoice");
      return;
    }

    const subscription = await stripe.subscriptions.retrieve(
      invoice.subscription as string,
    );

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    const { userId } = subscription.metadata;
    if (!userId) {
      throw new Error("Missing userId in subscription metadata");
    }

    const priceId = subscription.items.data[0]?.price.id;
    if (!priceId) {
      console.log("⚠️ Missing price ID in subscription");
      return;
    }

    const plan = getSubscriptionPlan(priceId);
    console.log(`📋 Invoice payment succeeded - mapping price ${priceId} to plan ${plan}`);

    const db = getDb();
    const customer = await db
      .selectFrom("Customer")
      .selectAll()
      .where("authUserId", "=", userId)
      .executeTakeFirst();

    if (customer) {
      await db
        .updateTable("Customer")
        .where("id", "=", customer.id)
        .set({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
          plan: plan,
        })
        .execute();

      console.log(`✅ Updated customer ${userId} subscription with plan ${plan}`);
    } else {
      console.log(`⚠️ Customer not found for userId: ${userId}`);
    }
  }
  if (event.type === "customer.subscription.updated") {
    const subscription = event.data.object as Stripe.Subscription;

    const customerId =
      typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer.id;

    const { userId } = subscription.metadata;
    if (!userId) {
      console.log("⚠️ Missing userId in subscription metadata for update");
      return;
    }

    const priceId = subscription.items.data[0]?.price.id;
    if (!priceId) {
      console.log("⚠️ Missing price ID in subscription update");
      return;
    }

    const plan = getSubscriptionPlan(priceId);
    console.log(`📋 Subscription updated - mapping price ${priceId} to plan ${plan}`);

    const db = getDb();
    const customer = await db
      .selectFrom("Customer")
      .selectAll()
      .where("authUserId", "=", userId)
      .executeTakeFirst();

    if (customer) {
      await db
        .updateTable("Customer")
        .where("id", "=", customer.id)
        .set({
          stripeCustomerId: customerId,
          stripeSubscriptionId: subscription.id,
          stripePriceId: priceId,
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000,
          ),
          plan: plan,
        })
        .execute();

      console.log(`✅ Updated customer ${userId} subscription change to plan ${plan}`);
    } else {
      console.log(`⚠️ Customer not found for userId: ${userId}`);
    }
  }

  console.log("✅ Stripe Webhook Processed");
}
