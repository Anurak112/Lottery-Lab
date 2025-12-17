import Stripe from "stripe";

// Initialize Stripe with secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("[Stripe] STRIPE_SECRET_KEY not found in environment variables");
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-12-15.clover",
    })
  : null;

/**
 * Create a Stripe checkout session for Pro subscription
 */
export async function createCheckoutSession(
  userId: number,
  userEmail: string | null,
  successUrl: string,
  cancelUrl: string
): Promise<string> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "thb",
          product_data: {
            name: "Pro Subscription",
            description: "Access to premium features including number sets, referral system, and leaderboard",
          },
          unit_amount: 9900, // 99 THB
          recurring: {
            interval: "month",
          },
        },
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: successUrl,
    cancel_url: cancelUrl,
    customer_email: userEmail || undefined,
    metadata: {
      userId: userId.toString(),
    },
    subscription_data: {
      metadata: {
        userId: userId.toString(),
      },
    },
  });

  return session.url!;
}

/**
 * Get checkout session details
 */
export async function getCheckoutSession(sessionId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return await stripe.checkout.sessions.retrieve(sessionId);
}

/**
 * Construct webhook event from request
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

/**
 * Cancel a subscription
 */
export async function cancelStripeSubscription(subscriptionId: string): Promise<void> {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  await stripe.subscriptions.cancel(subscriptionId);
}
