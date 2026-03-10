"use client"

import { useEffect, useRef, useState } from "react"
import { motion, useInView } from "framer-motion"
import { DollarSign, Clock, FileText } from "lucide-react"

function AnimatedNumber({ 
  value, 
  prefix = "", 
  suffix = "",
  duration = 2000 
}: { 
  value: number
  prefix?: string
  suffix?: string
  duration?: number
}) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true
      let startTime: number
      let animationFrame: number

      const animate = (currentTime: number) => {
        if (!startTime) startTime = currentTime
        const progress = Math.min((currentTime - startTime) / duration, 1)
        setCount(Math.floor(progress * value))

        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }

      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    }
  }, [isInView, value, duration])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString("pt-BR")}{suffix}
    </span>
  )
}

const problems = [
  {
    icon: DollarSign,
    value: 320,
    prefix: "R$",
    suffix: "",
    label: "perdidos por falta não avisada",
    description: "Em media, cada paciente que falta representa uma perda direta no seu faturamento mensal.",
    color: "text-red-500",
    bgColor: "bg-red-50",
    borderColor: "border-red-100",
  },
  {
    icon: Clock,
    value: 47,
    prefix: "",
    suffix: " min/dia",
    label: "respondendo WhatsApp de agendamento",
    description: "Tempo precioso gasto com tarefas repetitivas que poderiam ser automatizadas.",
    color: "text-amber-500",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-100",
  },
  {
    icon: FileText,
    value: 3,
    prefix: "",
    suffix: " de cada 5",
    label: "dentistas ainda usam agenda de papel",
    description: "Perdendo tempo, informações e oportunidades de crescimento da clínica.",
    color: "text-blue-500",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-100",
  },
]

export function Problem() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <section id="problema" className="bg-white py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center rounded-full bg-red-50 px-4 py-1.5 text-sm font-medium text-red-600">
            O problema
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-[#0A2540] sm:text-4xl lg:text-5xl">
            <span className="text-balance">Sua clínica está perdendo dinheiro</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
            Enquanto você atende, oportunidades escapam por falta de organização e automação.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.label}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              className={`group relative overflow-hidden rounded-2xl border ${problem.borderColor} ${problem.bgColor} p-8 transition-all hover:shadow-lg`}
            >
              <div className={`mb-6 inline-flex rounded-xl ${problem.bgColor} p-3`}>
                <problem.icon className={`h-6 w-6 ${problem.color}`} />
              </div>

              <div className={`font-display text-4xl font-bold ${problem.color} lg:text-5xl`}>
                <AnimatedNumber
                  value={problem.value}
                  prefix={problem.prefix}
                  suffix={problem.suffix}
                />
              </div>

              <h3 className="mt-2 text-xl font-semibold text-[#0A2540]">
                {problem.label}
              </h3>

              <p className="mt-3 text-gray-600">
                {problem.description}
              </p>

              {/* Decorative element */}
              <div className={`absolute -right-8 -top-8 h-32 w-32 rounded-full ${problem.bgColor} opacity-50 transition-transform group-hover:scale-150`} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
