import { router, publicProcedure, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import {
  createCheckoutSession,
  getCheckoutSession,
  constructWebhookEvent,
} from "./stripeService";
import {
  createSubscription,
  getActiveSubscription,
  getSubscriptionByStripeId,
  getUserTier,
  updateSubscriptionStatus,
} from "./subscriptionDb";

// Get frontend URL from environment (will use dev server URL)
const getFrontendUrl = () => {
  return process.env.VITE_FRONTEND_URL || "http://localhost:3000";
};

export const stripeRouter = router({
  /**
   * Create checkout session for Pro subscription
   */
  createCheckout: protectedProcedure.mutation(async ({ ctx }) => {
    const frontendUrl = getFrontendUrl();
    
    // IMPORTANT: Redirect to /pro (Pro Dashboard) on success, not just /payment/success
    const successUrl = `${frontendUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${frontendUrl}/payment/cancel`;

    try {
      const checkoutUrl = await createCheckoutSession(
        ctx.user.id,
        ctx.user.email,
        successUrl,
        cancelUrl
      );

      return { url: checkoutUrl };
    } catch (error) {
      console.error("[Stripe] Create checkout error:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to create checkout session",
      });
    }
  }),

  /**
   * Complete checkout after successful payment
   * This is called from the PaymentSuccess page
   */
  completeCheckout: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      try {
        // Get session details from Stripe
        const session = await getCheckoutSession(input.sessionId);

        if (session.payment_status !== "paid") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Payment not completed",
          });
        }

        // Check if subscription already exists
        const existingSubscription = await getActiveSubscription(ctx.user.id);
        if (existingSubscription && existingSubscription.tier === "pro") {
          return { success: true, alreadyExists: true };
        }

        // Create subscription in database
        const stripeSubscriptionId = session.subscription as string;
        const stripeCustomerId = session.customer as string;

        await createSubscription(
          ctx.user.id,
          "pro",
          stripeSubscriptionId,
          stripeCustomerId
        );

        return { success: true, alreadyExists: false };
      } catch (error) {
        console.error("[Stripe] Complete checkout error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to complete checkout",
        });
      }
    }),

  /**
   * Get current subscription status
   */
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const subscription = await getActiveSubscription(ctx.user.id);
    const tier = await getUserTier(ctx.user.id);

    return {
      subscription,
      tier,
      isPro: tier === "pro",
    };
  }),

  /**
   * Webhook handler for Stripe events
   * This should be called from an Express route, not tRPC
   */
  handleWebhook: publicProcedure
    .input(
      z.object({
        payload: z.string(),
        signature: z.string(),
      })
    )
    .mutation(async ({ input }) => {
      try {
        const event = constructWebhookEvent(input.payload, input.signature);

        switch (event.type) {
          case "checkout.session.completed": {
            const session = event.data.object as any;
            const userId = parseInt(session.metadata.userId);
            const stripeSubscriptionId = session.subscription as string;
            const stripeCustomerId = session.customer as string;

            // Create subscription
            await createSubscription(
              userId,
              "pro",
              stripeSubscriptionId,
              stripeCustomerId
            );
            break;
          }

          case "customer.subscription.deleted": {
            const subscription = event.data.object as any;
            const dbSubscription = await getSubscriptionByStripeId(subscription.id);
            
            if (dbSubscription) {
              await updateSubscriptionStatus(dbSubscription.id, "cancelled");
            }
            break;
          }

          default:
            console.log(`[Stripe] Unhandled event type: ${event.type}`);
        }

        return { success: true };
      } catch (error) {
        console.error("[Stripe] Webhook error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Webhook processing failed",
        });
      }
    }),
});
