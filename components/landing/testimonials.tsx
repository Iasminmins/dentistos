"use client"

import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import { Star } from "lucide-react"

const testimonials = [
  {
    name: "Dra. Maria Fernanda",
    role: "Ortodontista",
    location: "São Paulo, SP",
    cro: "CRO-SP 98.432",
    avatar: "MF",
    rating: 5,
    text: "Minhas faltas caíram 90% no primeiro mês. O sistema de confirmação pelo WhatsApp é genial. Os pacientes adoram receber o lembrete e eu adoro não precisar ligar mais.",
  },
  {
    name: "Dr. Carlos Eduardo",
    role: "Implantodontista",
    location: "Belo Horizonte, MG",
    cro: "CRO-MG 45.211",
    avatar: "CE",
    rating: 5,
    text: "O odontograma digital mudou minha vida. Antes eu perdia tempo procurando fichas de papel. Agora tenho todo o histórico do paciente em um clique. Vale cada centavo.",
  },
  {
    name: "Dra. Ana Paula",
    role: "Clínica Geral",
    location: "Curitiba, PR",
    cro: "CRO-PR 23.897",
    avatar: "AP",
    rating: 5,
    text: "Comecei sozinha e hoje tenho 2 dentistas na minha clínica. O DentistOS cresceu junto comigo. O suporte é excepcional, sempre respondem rápido.",
  },
]

export function Testimonials() {
  const containerRef = useRef(null)
  const isInView = useInView(containerRef, { once: true, margin: "-100px" })

  return (
    <section className="bg-[#0A2540] py-20 lg:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={containerRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <span className="inline-flex items-center rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-[#00C9A7]">
            Depoimentos
          </span>
          <h2 className="mt-4 font-display text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            <span className="text-balance">Dentistas que já transformaram suas clínicas</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-white/60">
            Mais de 1.200 profissionais já confiam no DentistOS para gerenciar suas agendas.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
              className="relative rounded-2xl bg-white p-8"
            >
              {/* Rating */}
              <div className="flex gap-1">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 fill-amber-400 text-amber-400"
                  />
                ))}
              </div>

              {/* Text */}
              <p className="mt-6 text-gray-600 leading-relaxed">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author */}
              <div className="mt-8 flex items-center gap-4 border-t border-gray-100 pt-6">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0A2540] font-semibold text-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-[#0A2540]">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role} - {testimonial.location}
                  </div>
                  <div className="text-xs text-[#00C9A7]">{testimonial.cro}</div>
                </div>
              </div>

              {/* Decorative quote */}
              <div className="absolute right-8 top-8 text-6xl font-serif text-gray-100">
                &ldquo;
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
