"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { CalendarPlus, MessageCircle, Bell, Users } from "lucide-react"

const steps = [
  {
    icon: CalendarPlus,
    number: "01",
    title: "Paciente agenda online",
    description: "Pelo link exclusivo da sua clínica, 24 horas por dia, sem precisar ligar.",
  },
  {
    icon: MessageCircle,
    number: "02",
    title: "Confirmação automática",
    description: "Sistema envia WhatsApp pedindo confirmação. Sem esforço manual.",
  },
  {
    icon: Bell,
    number: "03",
    title: "Lembretes inteligentes",
    description: "48h e 2h antes da consulta. Paciente não esquece, você não perde.",
  },
  {
    icon: Users,
    number: "04",
    title: "Lista de espera ativa",
    description: "Cancelou? Sistema oferece o horário automaticamente para quem está na fila.",
  },
]

export function Solution() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <section id="solucao" className="bg-gray-50 py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center rounded-full bg-[#00C9A7]/10 px-4 py-1.5 text-sm font-medium text-[#00C9A7]">
            A solução
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-[#0A2540] sm:text-4xl lg:text-5xl">
            <span className="text-balance">Como o DentistOS funciona</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Em 4 passos simples, sua agenda passa a funcionar no piloto automático.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative mt-20">
          {/* Connection line */}
          <div className="absolute left-1/2 top-0 hidden h-full w-0.5 -translate-x-1/2 bg-gradient-to-b from-[#00C9A7] via-[#00C9A7]/50 to-transparent lg:block" />

          <div className="grid gap-12 lg:gap-0">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.15 * (index + 1) }}
                className={`relative flex flex-col items-center gap-8 lg:flex-row ${
                  index % 2 === 0 ? "" : "lg:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div className={`flex-1 ${index % 2 === 0 ? "lg:text-right" : "lg:text-left"}`}>
                  <div
                    className={`inline-flex items-center gap-4 ${
                      index % 2 === 0 ? "lg:flex-row-reverse" : ""
                    }`}
                  >
                    <span className="font-display text-sm font-bold text-[#00C9A7]">
                      {step.number}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-[#0A2540]">
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-3 max-w-md text-gray-600 lg:mx-0 mx-auto">
                    {step.description}
                  </p>
                </div>

                {/* Icon */}
                <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A2540] shadow-lg">
                  <step.icon className="h-7 w-7 text-[#00C9A7]" />
                  {/* Pulse effect */}
                  <div className="absolute inset-0 animate-ping rounded-2xl bg-[#00C9A7]/20" style={{ animationDuration: "3s" }} />
                </div>

                {/* Spacer for alignment */}
                <div className="hidden flex-1 lg:block" />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <p className="text-lg text-gray-600">
            Tudo isso funcionando enquanto você atende seus pacientes.
          </p>
          <p className="mt-2 font-display text-xl font-semibold text-[#0A2540]">
            Zero trabalho manual. Maximo resultado.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
