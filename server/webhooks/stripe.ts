import { Request, Response } from "express";
import Stripe from "stripe";
import { ENV } from "../_core/env";
import * as db from "../db";

const stripe = new Stripe(ENV.stripeSecretKey, {
  apiVersion: "2025-10-29.clover",
});

/**
 * Webhook handler para eventos do Stripe
 * Processa eventos de checkout e subscription para atualizar o banco de dados automaticamente
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  const sig = req.headers["stripe-signature"];

  if (!sig) {
    console.error("[Stripe Webhook] Missing stripe-signature header");
    return res.status(200).json({ verified: false, error: "Missing stripe-signature header" });
  }

  let event: Stripe.Event;

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      ENV.stripeWebhookSecret
    );
  } catch (err: any) {
    console.error(`[Stripe Webhook] Signature verification failed: ${err.message}`);
    return res.status(200).json({ verified: false, error: `Webhook Error: ${err.message}` });
  }

  console.log(`[Stripe Webhook] Received event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentSucceeded(invoice);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }

    // Sempre retornar 200 OK com JSON válido
    return res.status(200).json({ verified: true, received: true });
  } catch (error: any) {
    console.error(`[Stripe Webhook] Error processing event: ${error.message}`);
    // Mesmo em caso de erro, retornar 200 OK
    return res.status(200).json({ verified: true, received: true, error: error.message });
  }
}

/**
 * Processar checkout completado - criar nova assinatura
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log(`[Stripe Webhook] Processing checkout.session.completed: ${session.id}`);

  const { customer, subscription: subscriptionId, metadata } = session;

  if (!customer || !subscriptionId || !metadata?.farmId) {
    console.error("[Stripe Webhook] Missing required data in checkout session");
    return;
  }

  // Buscar detalhes da subscription
  const subscriptionData: any = await stripe.subscriptions.retrieve(subscriptionId as string);

  const plan = metadata.plan || "basic";
  const farmId = parseInt(metadata.farmId);

  // Mapear status do Stripe para status do banco
  const statusMap: Record<string, "active" | "canceled" | "past_due" | "trialing"> = {
    active: "active",
    canceled: "canceled",
    past_due: "past_due",
    trialing: "trialing",
    incomplete: "trialing", // Mapear incomplete para trialing
    incomplete_expired: "canceled",
    unpaid: "past_due",
  };

  const mappedStatus = statusMap[subscriptionData.status] || "active";

  // Criar registro de subscription no banco
  await db.createSubscription({
    userId: farmId,
    stripeCustomerId: customer as string,
    stripeSubscriptionId: subscriptionId as string,
    stripePriceId: subscriptionData.items.data[0]?.price.id || "",
    planId: plan as "basic" | "professional" | "enterprise",
    status: mappedStatus,
    currentPeriodStart: new Date(subscriptionData.current_period_start * 1000),
    currentPeriodEnd: subscriptionData.current_period_end ? new Date(subscriptionData.current_period_end * 1000) : undefined,
  });

  // Enviar notificação de boas-vindas
  await db.createNotification({
    userId: farmId,
    type: "other",
    title: "Assinatura ativada com sucesso! 🎉",
    message: `Bem-vindo ao plano ${plan === "basic" ? "Básico" : plan === "professional" ? "Profissional" : "Empresarial"}! Sua assinatura está ativa e você já pode aproveitar todos os recursos.`,
  });

  console.log(`[Stripe Webhook] Subscription created for farm ${farmId}, plan: ${plan}`);
}

/**
 * Processar atualização de subscription
 */
async function handleSubscriptionUpdated(subscription: any) {
  console.log(`[Stripe Webhook] Processing customer.subscription.updated: ${subscription.id}`);

  const farmSubscription = await db.getSubscriptionByStripeId(subscription.id);

  if (!farmSubscription) {
    console.error(`[Stripe Webhook] Subscription not found: ${subscription.id}`);
    return;
  }

  // Atualizar status e período
  await db.updateSubscription(farmSubscription.id, {
    status: subscription.status,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: subscription.current_period_end ? new Date(subscription.current_period_end * 1000) : undefined,
  });

  // Notificar sobre mudanças importantes no status
  if (subscription.status === "active" && farmSubscription.status !== "active") {
    await db.createNotification({
      userId: farmSubscription.userId,
      type: "other",
      title: "Assinatura reativada",
      message: "Sua assinatura foi reativada com sucesso. Todos os recursos estão disponíveis novamente.",
    });
  }

  console.log(`[Stripe Webhook] Subscription ${subscription.id} updated, status: ${subscription.status}`);
}

/**
 * Processar cancelamento de subscription
 */
async function handleSubscriptionDeleted(subscription: any) {
  console.log(`[Stripe Webhook] Processing customer.subscription.deleted: ${subscription.id}`);

  const farmSubscription = await db.getSubscriptionByStripeId(subscription.id);

  if (!farmSubscription) {
    console.error(`[Stripe Webhook] Subscription not found: ${subscription.id}`);
    return;
  }

  // Atualizar status para canceled
  await db.updateSubscription(farmSubscription.id, {
    status: "canceled",
  });

  // Notificar sobre cancelamento
  await db.createNotification({
    userId: farmSubscription.userId,
    type: "other",
    title: "Assinatura cancelada",
    message: "Sua assinatura foi cancelada. Você ainda pode acessar o sistema até o final do período já pago. Para reativar, visite a página de planos.",
  });

  console.log(`[Stripe Webhook] Subscription ${subscription.id} canceled`);
}

/**
 * Processar pagamento de invoice bem-sucedido
 */
async function handleInvoicePaymentSucceeded(invoice: any) {
  console.log(`[Stripe Webhook] Processing invoice.payment_succeeded: ${invoice.id}`);

  const subscriptionId = invoice.subscription as string | null;
  
  if (!subscriptionId) {
    return;
  }

  const farmSubscription = await db.getSubscriptionByStripeId(subscriptionId);

  if (!farmSubscription) {
    return;
  }

  // Pagamento bem-sucedido - subscription já está ativa
  console.log(`[Stripe Webhook] Payment successful for farm ${farmSubscription.userId}`);

  // Notificar sobre pagamento bem-sucedido (apenas se não for o primeiro pagamento)
  if (invoice.billing_reason === "subscription_cycle") {
    await db.createNotification({
      userId: farmSubscription.userId,
      type: "other",
      title: "Pagamento processado com sucesso",
      message: `Seu pagamento de ${invoice.amount_paid ? (invoice.amount_paid / 100).toLocaleString("pt-BR", { style: "currency", currency: invoice.currency?.toUpperCase() || "BRL" }) : ""} foi processado. Sua assinatura continua ativa.`,
    });
  }

  console.log(`[Stripe Webhook] Payment recorded for subscription ${subscriptionId}`);
}

/**
 * Processar falha de pagamento de invoice
 */
async function handleInvoicePaymentFailed(invoice: any) {
  console.log(`[Stripe Webhook] Processing invoice.payment_failed: ${invoice.id}`);

  const subscriptionId = invoice.subscription as string | null;
  
  if (!subscriptionId) {
    return;
  }

  const farmSubscription = await db.getSubscriptionByStripeId(subscriptionId);

  if (!farmSubscription) {
    return;
  }

  // Atualizar status para past_due
  await db.updateSubscription(farmSubscription.id, {
    status: "past_due",
  });

  // Notificar sobre falha no pagamento
  await db.createNotification({
    userId: farmSubscription.userId,
    type: "other",
    title: "Falha no pagamento da assinatura",
    message: "Não conseguimos processar seu pagamento. Por favor, atualize seu método de pagamento para evitar a interrupção do serviço. Acesse Gerenciar Assinatura para atualizar.",
  });

  console.log(`[Stripe Webhook] Payment failed for subscription ${subscriptionId}`);
}
