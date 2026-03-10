import { NextRequest, NextResponse } from "next/server"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

export async function POST(req: NextRequest) {
  try {
    const { email, userId, clinica } = await req.json()

    if (!email || !userId) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 })
    }

    const customers = await stripe.customers.list({ email, limit: 1 })
    let customer = customers.data[0]

    if (!customer) {
      customer = await stripe.customers.create({
        email,
        name: clinica || email,
        metadata: { supabase_user_id: userId },
      })
    }

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID!,
          quantity: 1,
        },
      ],
      subscription_data: {
        trial_period_days: 14,
        metadata: { supabase_user_id: userId },
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/cadastro/sucesso?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cadastro?cancelado=1`,
      metadata: { supabase_user_id: userId },
      locale: "pt-BR",
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error("Stripe checkout error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
