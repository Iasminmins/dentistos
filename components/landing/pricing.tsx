"use client"

import { useRef } from "react"
import Link from "next/link"
import { motion, useInView } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

const features = [
  "Agenda semanal e diária",
  "Cadastro ilimitado de pacientes",
  "Prontuário digital completo",
  "Odontograma interativo (32 dentes)",
  "Histórico de consultas",
  "Financeiro completo (receitas e despesas)",
  "Meta mensal com barra de progresso",
  "WhatsApp automático (Z-API)",
  "Confirmação 48h e lembrete 2h antes",
  "Templates de mensagem editáveis",
  "Reativação de pacientes inativos",
  "Suporte prioritário via WhatsApp",
]

export function Pricing() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <section id="precos" className="bg-gray-50 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center rounded-full bg-[#00C9A7]/10 px-4 py-1.5 text-sm font-medium text-[#00C9A7]">
            Preço simples e justo
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-[#0A2540] sm:text-4xl lg:text-5xl">
            Tudo incluso. Sem surpresas.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Um plano completo com todas as funcionalidades. Comece grátis por 14 dias — cartão necessário para iniciar o trial.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mx-auto mt-16 max-w-lg"
        >
          <div className="relative rounded-2xl border-2 border-[#00C9A7] bg-white p-10 shadow-xl shadow-[#00C9A7]/10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="rounded-full bg-[#00C9A7] px-5 py-1.5 text-sm font-semibold text-[#0A2540]">
                Acesso completo
              </span>
            </div>

            <div className="text-center">
              <h3 className="font-display text-2xl font-bold text-[#0A2540]">DentistOS</h3>
              <p className="mt-2 text-gray-500">Para dentistas que querem sua clínica no piloto automático</p>
              <div className="mt-8 flex items-end justify-center gap-1">
                <span className="text-lg font-medium text-gray-500">R$</span>
                <span className="font-display text-7xl font-bold text-[#0A2540]">250</span>
                <span className="mb-2 text-gray-500">/mês</span>
              </div>
              <p className="mt-2 text-sm text-[#00C9A7] font-medium">14 dias grátis para testar tudo</p>
            </div>

            <ul className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 shrink-0 text-[#00C9A7] mt-0.5" />
                  <span className="text-sm text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>

            <Link href="/cadastro" className="mt-10 block">
              <Button className="w-full bg-[#00C9A7] text-[#0A2540] hover:bg-[#00C9A7]/90 text-base font-semibold" size="lg">
                Começar 14 dias grátis
              </Button>
            </Link>

            <p className="mt-4 text-center text-xs text-gray-400">
              Cartão necessário · Cancele quando quiser
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 text-center"
        >
          <p className="text-gray-600">
            Dúvidas?{" "}
            <a href="https://wa.me/5524999327549" target="_blank" rel="noopener noreferrer"
              className="font-medium text-[#00C9A7] hover:underline">
              Fale com a gente no WhatsApp
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
