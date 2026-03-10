"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { Play, ArrowRight } from "lucide-react"

// Animated counter component
function AnimatedCounter({ target, duration = 2000 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      setCount(Math.floor(progress * target))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration])

  return <span>{count.toLocaleString("pt-BR")}</span>
}

// Floating particles background with fixed positions to avoid hydration mismatch
const particlePositions = [
  { x: 10, y: 20, duration: 4.2, delay: 0.5 },
  { x: 85, y: 15, duration: 5.1, delay: 1.2 },
  { x: 30, y: 70, duration: 4.8, delay: 0.8 },
  { x: 70, y: 50, duration: 5.5, delay: 1.5 },
  { x: 50, y: 85, duration: 4.5, delay: 0.3 },
  { x: 15, y: 45, duration: 5.2, delay: 1.8 },
]

function ParticlesBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,201,167,0.15),transparent)]" />
      
      {/* Floating elements */}
      {particlePositions.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full bg-[#00C9A7]/20"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
          }}
        />
      ))}
    </div>
  )
}

// Dashboard mockup
function DashboardMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -5 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.8, delay: 0.5 }}
      className="relative mx-auto mt-12 max-w-4xl px-4 lg:mt-0 lg:px-0"
    >
      <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-1 shadow-2xl backdrop-blur-sm">
        {/* Browser bar */}
        <div className="flex items-center gap-2 rounded-t-lg bg-[#0A2540]/50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-400/80" />
            <div className="h-3 w-3 rounded-full bg-yellow-400/80" />
            <div className="h-3 w-3 rounded-full bg-green-400/80" />
          </div>
          <div className="ml-4 flex-1 rounded-md bg-white/10 px-3 py-1 text-xs text-white/50">
            app.dentistos.com.br/dashboard
          </div>
        </div>
        
        {/* Dashboard content */}
        <div className="grid grid-cols-12 gap-4 rounded-b-lg bg-white p-4">
          {/* Sidebar */}
          <div className="col-span-3 hidden space-y-2 rounded-lg bg-[#0A2540] p-3 lg:block">
            {["Inicio", "Agenda", "Pacientes", "Financeiro"].map((item, i) => (
              <div
                key={item}
                className={`rounded-md px-3 py-2 text-xs font-medium ${
                  i === 1 ? "bg-[#00C9A7] text-[#0A2540]" : "text-white/70"
                }`}
              >
                {item}
              </div>
            ))}
          </div>
          
          {/* Main content */}
          <div className="col-span-12 space-y-4 lg:col-span-9">
            {/* Stats */}
            <div className="grid grid-cols-4 gap-3">
              {[
                { label: "Hoje", value: "8", color: "bg-[#00C9A7]" },
                { label: "Confirmadas", value: "6", color: "bg-emerald-500" },
                { label: "Pendentes", value: "2", color: "bg-amber-500" },
                { label: "Faltas", value: "0", color: "bg-red-400" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-lg border border-gray-100 bg-gray-50/50 p-3 text-center"
                >
                  <div className={`mx-auto mb-1 h-1 w-8 rounded-full ${stat.color}`} />
                  <div className="text-lg font-bold text-[#0A2540]">{stat.value}</div>
                  <div className="text-[10px] text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
            
            {/* Appointments */}
            <div className="space-y-2">
              {[
                { time: "09:00", name: "Maria Silva", status: "confirmed" },
                { time: "10:30", name: "Joao Santos", status: "confirmed" },
                { time: "14:00", name: "Ana Costa", status: "pending" },
              ].map((apt) => (
                <div
                  key={apt.time}
                  className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-semibold text-[#0A2540]">{apt.time}</div>
                    <div className="text-sm text-gray-600">{apt.name}</div>
                  </div>
                  <div
                    className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      apt.status === "confirmed"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {apt.status === "confirmed" ? "Confirmado" : "Pendente"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 20, scale: 0.9 }}
        animate={{ opacity: 1, x: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.2 }}
        className="absolute -right-4 top-20 hidden rounded-lg border border-[#00C9A7]/20 bg-white p-3 shadow-xl lg:block"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#00C9A7]/10">
            <svg className="h-4 w-4 text-[#00C9A7]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            </svg>
          </div>
          <div>
            <div className="text-xs font-medium text-[#0A2540]">Confirmação enviada</div>
            <div className="text-[10px] text-gray-500">Maria confirmou para 09:00</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0A2540] pt-20">
      <ParticlesBackground />
      
      <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-8">
          {/* Content */}
          <div className="text-center lg:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full border border-[#00C9A7]/30 bg-[#00C9A7]/10 px-4 py-1.5 text-sm font-medium text-[#00C9A7]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C9A7] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00C9A7]" />
                </span>
                Novo: Integração com WhatsApp Business
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mt-6 font-display text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl"
            >
              <span className="text-balance">Chega de paciente</span>
              <br />
              <span className="text-[#00C9A7]">faltando sem avisar.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70 lg:mx-0"
            >
              DentistOS confirma, lembra e preenche sua agenda automaticamente.{" "}
              <span className="text-white">Você só cuida dos dentes.</span>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-8 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
            >
              <Link href="/cadastro">
                <Button
                  size="lg"
                  className="group h-12 gap-2 bg-[#00C9A7] px-6 text-base font-semibold text-[#0A2540] hover:bg-[#00C9A7]/90"
                >
                  Começar grátis por 14 dias
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Button
                variant="outline"
                size="lg"
                className="h-12 gap-2 border-white/20 bg-transparent px-6 text-base font-semibold text-white hover:bg-white/10 hover:text-white"
              >
                <Play className="h-4 w-4" />
                Ver demonstração
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-10 flex items-center justify-center gap-8 lg:justify-start"
            >
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-white">
                  <AnimatedCounter target={1240} />+
                </div>
                <div className="text-sm text-white/50">dentistas organizados</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-white">
                  <AnimatedCounter target={98} />%
                </div>
                <div className="text-sm text-white/50">menos faltas</div>
              </div>
              <div className="h-8 w-px bg-white/20" />
              <div className="text-center lg:text-left">
                <div className="text-2xl font-bold text-[#00C9A7]">
                  R$<AnimatedCounter target={320} />
                </div>
                <div className="text-sm text-white/50">economia/mês</div>
              </div>
            </motion.div>
          </div>

          {/* Dashboard Mockup */}
          <DashboardMockup />
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  )
}
