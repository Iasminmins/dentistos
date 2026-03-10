"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function CTA() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <section className="bg-[#00C9A7] py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <h2 className="font-display text-3xl font-bold text-[#0A2540] sm:text-4xl lg:text-5xl">
            <span className="text-balance">Sua primeira consulta sem falta começa hoje.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-[#0A2540]/70">
            Junte-se a mais de 1.200 dentistas que já transformaram a gestão de suas clínicas.
          </p>

          <Link href="/cadastro" className="mt-10 inline-block">
            <Button
              size="lg"
              className="group h-14 gap-3 bg-[#0A2540] px-8 text-lg font-semibold text-white hover:bg-[#0A2540]/90"
            >
              Criar conta grátis - teste 14 dias
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>

          <p className="mt-6 text-sm text-[#0A2540]/60">
            14 dias grátis. Cancele quando quiser. Sem compromisso.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
