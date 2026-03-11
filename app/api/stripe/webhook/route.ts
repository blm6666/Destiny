import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return NextResponse.json(
      { error: "Missing signature or webhook secret" },
      { status: 400 }
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Webhook signature verification failed: ${message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.client_reference_id;
      if (!userId) break;

      const subscriptionId = session.subscription as string | null;
      const customerId = session.customer as string | null;

      if (subscriptionId) {
        const sub = await getStripe().subscriptions.retrieve(subscriptionId);
        const currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();

        await getSupabaseAdmin()
          .from("profiles")
          .update({
            is_subscribed: true,
            stripe_customer_id: customerId ?? undefined,
            stripe_subscription_id: subscriptionId,
            subscription_ends_at: currentPeriodEnd,
          })
          .eq("id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      const { data: profile } = await getSupabaseAdmin()
        .from("profiles")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .single();

      if (profile) {
        const currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
        await getSupabaseAdmin()
          .from("profiles")
          .update({
            subscription_ends_at: currentPeriodEnd,
            is_subscribed: sub.status === "active",
          })
          .eq("id", profile.id);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = sub.customer as string;

      await getSupabaseAdmin()
        .from("profiles")
        .update({
          is_subscribed: false,
          stripe_subscription_id: null,
          subscription_ends_at: null,
        })
        .eq("stripe_customer_id", customerId);
      break;
    }

    default:
      break;
  }

  return NextResponse.json({ received: true });
}
