import { Header } from "@/components/landing/header"
import { Hero } from "@/components/landing/hero"
import { Problem } from "@/components/landing/problem"
import { Solution } from "@/components/landing/solution"
import { Features } from "@/components/landing/features"
import { Testimonials } from "@/components/landing/testimonials"
import { Pricing } from "@/components/landing/pricing"
import { CTA } from "@/components/landing/cta"
import { Footer } from "@/components/landing/footer"

export default function LandingPage() {
  return (
    <main>
      <Header />
      <Hero />
      <Problem />
      <Solution />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </main>
  )
}
