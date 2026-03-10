"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import {
  Calendar,
  MessageCircle,
  FileHeart,
  TrendingUp,
  FolderOpen,
  RefreshCw,
} from "lucide-react"

const features = [
  {
    icon: Calendar,
    title: "Agenda inteligente",
    description:
      "Visualize sua semana completa. Arraste para remarcar. Bloqueie horários. Tudo em um clique.",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp automático",
    description:
      "Confirmações, lembretes e reativação de pacientes. Templates personalizáveis.",
  },
  {
    icon: FileHeart,
    title: "Odontograma digital",
    description:
      "Clique no dente, registre o procedimento. Histórico completo em segundos.",
  },
  {
    icon: TrendingUp,
    title: "Financeiro simplificado",
    description:
      "Lançamentos, caixa do dia, parcelamentos e relatórios. Sem complicação.",
  },
  {
    icon: FolderOpen,
    title: "Prontuário com upload",
    description:
      "Raio-x, fotos, documentos. Tudo organizado por paciente na nuvem.",
  },
  {
    icon: RefreshCw,
    title: "Reativação de pacientes",
    description:
      "Paciente sumiu? Sistema identifica e envia mensagem automática para voltar.",
  },
]

export function Features() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <section id="features" className="bg-white py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center rounded-full bg-[#0A2540]/5 px-4 py-1.5 text-sm font-medium text-[#0A2540]">
            Recursos
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-[#0A2540] sm:text-4xl lg:text-5xl">
            <span className="text-balance">Tudo que sua clínica precisa</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Ferramentas pensadas por dentistas, para dentistas. Simples de usar, poderosas nos resultados.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              className="group relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-8 transition-all duration-300 hover:border-[#00C9A7]/30 hover:shadow-lg hover:shadow-[#00C9A7]/5"
            >
              {/* Icon */}
              <div className="mb-6 inline-flex rounded-xl bg-[#0A2540]/5 p-3 transition-colors group-hover:bg-[#00C9A7]/10">
                <feature.icon className="h-6 w-6 text-[#0A2540] transition-colors group-hover:text-[#00C9A7]" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-bold text-[#0A2540]">
                {feature.title}
              </h3>
              <p className="mt-3 text-gray-600">{feature.description}</p>

              {/* Hover indicator */}
              <div className="absolute bottom-0 left-0 h-1 w-0 bg-[#00C9A7] transition-all duration-300 group-hover:w-full" />
            </motion.div>
          ))}
        </div>

        {/* Extra highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-16 rounded-2xl bg-gradient-to-r from-[#0A2540] to-[#0A2540]/90 p-8 lg:p-12"
        >
          <div className="flex flex-col items-center justify-between gap-8 lg:flex-row">
            <div>
              <h3 className="font-display text-2xl font-bold text-white lg:text-3xl">
                Integração com WhatsApp Business
              </h3>
              <p className="mt-2 max-w-xl text-white/70">
                Conecte seu número comercial e deixe o DentistOS cuidar de toda a comunicação com seus pacientes. API oficial, sem riscos.
              </p>
            </div>
            <div className="flex items-center gap-3 rounded-full bg-[#00C9A7] px-6 py-3 text-[#0A2540]">
              <MessageCircle className="h-5 w-5" />
              <span className="font-semibold">WhatsApp conectado</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
