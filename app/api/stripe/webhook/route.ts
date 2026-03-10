import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get("stripe-signature")!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 })
  }

  // Assinatura criada (trial iniciado) — ativa o tenant
  if (event.type === "customer.subscription.created") {
    const sub = event.data.object as Stripe.Subscription
    const userId = sub.metadata?.supabase_user_id
    if (userId) {
      await supabaseAdmin
        .from("tenants")
        .update({
          plano: "pro",
          status: "trial",
          stripe_customer_id: sub.customer as string,
          subscription_id: sub.id,
          trial_ends_at: new Date(sub.trial_end! * 1000).toISOString(),
        })
        .eq("owner_id", userId)
    }
  }

  // Pagamento aprovado após trial — ativa como ativo
  if (event.type === "invoice.payment_succeeded") {
    const invoice = event.data.object as Stripe.Invoice
    const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const userId = sub.metadata?.supabase_user_id
    if (userId) {
      await supabaseAdmin
        .from("tenants")
        .update({ status: "ativo" })
        .eq("owner_id", userId)
    }
  }

  // Pagamento falhou — bloqueia acesso
  if (event.type === "invoice.payment_failed") {
    const invoice = event.data.object as Stripe.Invoice
    const sub = await stripe.subscriptions.retrieve(invoice.subscription as string)
    const userId = sub.metadata?.supabase_user_id
    if (userId) {
      await supabaseAdmin
        .from("tenants")
        .update({ status: "inativo" })
        .eq("owner_id", userId)
    }
  }

  return NextResponse.json({ received: true })
}
