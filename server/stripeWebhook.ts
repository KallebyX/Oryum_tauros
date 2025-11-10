import express from 'express';
import Stripe from 'stripe';
import * as subscriptionDb from './subscriptionDb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-10-29.clover',
});

export function setupStripeWebhook(app: express.Application) {
  // CRITICAL: Register raw body parser BEFORE express.json()
  app.post(
    '/api/stripe/webhook',
    express.raw({ type: 'application/json' }),
    async (req, res) => {
      const sig = req.headers['stripe-signature'];

      if (!sig) {
        console.error('[Webhook] Missing stripe-signature header');
        return res.status(400).send('Missing signature');
      }

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err: any) {
        console.error('[Webhook] Signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      console.log(`[Webhook] Received event: ${event.type} (${event.id})`);

      // CRITICAL: Handle test events
      if (event.id.startsWith('evt_test_')) {
        console.log('[Webhook] Test event detected, returning verification response');
        return res.json({
          verified: true,
        });
      }

      try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            console.log('[Webhook] Checkout completed:', session.id);

            // Get customer and subscription details
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            if (subscriptionId) {
              // Fetch full subscription details
              const subscription = await stripe.subscriptions.retrieve(subscriptionId);

              // Get user from metadata
              const userId = session.client_reference_id || session.metadata?.user_id;
              
              if (userId) {
                // Update user's Stripe customer ID
                await subscriptionDb.updateUserStripeCustomerId(
                  parseInt(userId),
                  customerId
                );

                // Create subscription record
                await subscriptionDb.createSubscription({
                  userId: parseInt(userId),
                  stripeSubscriptionId: subscription.id,
                  stripePriceId: subscription.items.data[0].price.id,
                  status: subscription.status as any,
                  currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
                  currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
                  cancelAtPeriodEnd: subscription.cancel_at_period_end,
                });

                console.log('[Webhook] Subscription created for user:', userId);
              }
            }
            break;
          }

          case 'customer.subscription.updated': {
            const subscription = event.data.object as Stripe.Subscription;
            console.log('[Webhook] Subscription updated:', subscription.id);

            await subscriptionDb.updateSubscription(subscription.id, {
              status: subscription.status as any,
              currentPeriodStart: new Date((subscription as any).current_period_start * 1000),
              currentPeriodEnd: new Date((subscription as any).current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            });
            break;
          }

          case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            console.log('[Webhook] Subscription deleted:', subscription.id);

            await subscriptionDb.updateSubscription(subscription.id, {
              status: 'canceled',
            });
            break;
          }

          case 'invoice.paid': {
            const invoice = event.data.object as Stripe.Invoice;
            console.log('[Webhook] Invoice paid:', invoice.id);
            // Handle successful payment if needed
            break;
          }

          case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            console.log('[Webhook] Invoice payment failed:', invoice.id);
            
            if ((invoice as any).subscription) {
              await subscriptionDb.updateSubscription((invoice as any).subscription as string, {
                status: 'past_due',
              });
            }
            break;
          }

          default:
            console.log(`[Webhook] Unhandled event type: ${event.type}`);
        }

        res.json({ received: true });
      } catch (error) {
        console.error('[Webhook] Error processing event:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
      }
    }
  );
}
