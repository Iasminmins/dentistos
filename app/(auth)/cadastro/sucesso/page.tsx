"use client"

import { Suspense } from "react"
import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Check, Calendar, MessageCircle, ArrowRight } from "lucide-react"

function SucessoContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [contador, setContador] = useState(5)

  useEffect(() => {
    if (!sessionId) return
    const timer = setInterval(() => {
      setContador(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          window.location.href = "/dashboard"
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [sessionId])

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md rounded-2xl bg-white p-10 text-center shadow-xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[#00C9A7]"
        >
          <Check className="h-10 w-10 text-white" strokeWidth={3} />
        </motion.div>

        <h1 className="font-display text-2xl font-bold text-[#0A2540]">
          Tudo certo! 🎉
        </h1>
        <p className="mt-3 text-gray-600">
          Seu cartão foi cadastrado com sucesso. Você tem <strong>14 dias grátis</strong> para testar tudo — sem cobranças agora.
        </p>

        <div className="mt-8 space-y-3 text-left">
          <p className="text-sm font-semibold uppercase tracking-wide text-gray-400">Próximos passos</p>
          <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-[#00C9A7]" />
            <div>
              <p className="font-medium text-[#0A2540]">Configure sua agenda</p>
              <p className="text-sm text-gray-500">Adicione seus horários de atendimento</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-gray-50 p-4">
            <MessageCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#00C9A7]" />
            <div>
              <p className="font-medium text-[#0A2540]">Conecte o WhatsApp</p>
              <p className="text-sm text-gray-500">Ative os lembretes automáticos para pacientes</p>
            </div>
          </div>
        </div>

        <Link href="/dashboard" className="mt-8 block">
          <Button className="w-full gap-2 bg-[#00C9A7] py-6 text-[#0A2540] hover:bg-[#00C9A7]/90 font-semibold">
            Ir para o Dashboard
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>

        {sessionId && (
          <p className="mt-4 text-xs text-gray-400">
            Redirecionando automaticamente em {contador}s...
          </p>
        )}
      </motion.div>
    </div>
  )
}

export default function CadastroSucessoPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Carregando...</div>}>
      <SucessoContent />
    </Suspense>
  )
}
