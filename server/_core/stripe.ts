import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  console.warn("[Stripe] STRIPE_SECRET_KEY not configured. Stripe features will be disabled.");
}

export const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: "2025-10-29.clover",
    })
  : null;

export async function createCheckoutSession(params: {
  priceId: string;
  userId: number;
  userEmail?: string;
  successUrl: string;
  cancelUrl: string;
}) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: params.priceId,
        quantity: 1,
      },
    ],
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    customer_email: params.userEmail,
    client_reference_id: params.userId.toString(),
    metadata: {
      userId: params.userId.toString(),
      farmId: params.userId.toString(), // Usando userId como farmId por enquanto
      plan: params.priceId.includes("basic") ? "basic" : params.priceId.includes("professional") ? "professional" : "enterprise",
    },
  });

  return session;
}

export async function getSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return await stripe.subscriptions.retrieve(subscriptionId);
}

export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function constructWebhookEvent(
  payload: string | Buffer,
  signature: string,
  webhookSecret: string
) {
  if (!stripe) {
    throw new Error("Stripe is not configured");
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}
