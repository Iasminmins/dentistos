"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Lock, User, Building2, Phone, ArrowRight, Chrome, Check } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const benefits = [
  "14 dias gratis para testar",
  "Agenda inteligente",
  "WhatsApp automático",
  "Suporte em portugues",
]

export default function CadastroPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ nome: "", clínica: "", email: "", telefone: "", password: "" })
  const router = useRouter()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const { data, error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            full_name: form.nome,
            clinic_name: form.clínica,
            phone: form.telefone,
          },
        },
      })
      if (error) throw error

      // Redireciona para Stripe Checkout com trial de 14 dias
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          userId: data.user?.id,
          clínica: form.clínica,
        }),
      })
      const { url, error: stripeError } = await res.json()
      if (stripeError) throw new Error(stripeError)
      window.location.href = url
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md rounded-2xl bg-white p-10 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#00C9A7]">
            <Check className="h-8 w-8 text-white" />
          </div>
          <h2 className="font-display text-2xl font-bold text-[#0A2540]">Conta criada com sucesso!</h2>
          <p className="mt-3 text-gray-600">Enviamos um email de confirmação para <strong>{form.email}</strong>. Verifique sua caixa de entrada para ativar sua conta.</p>
          <Link href="/login">
            <Button className="mt-6 w-full bg-[#0A2540] text-white hover:bg-[#0A2540]/90">Ir para o Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side */}
      <div className="hidden w-1/2 bg-[#0A2540] lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00C9A7]">
              <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-[#0A2540]" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C8 2 6 6 6 10c0 3 1 5 2 7s2 5 4 5 3-3 4-5 2-4 2-7c0-4-2-8-6-8z" />
              </svg>
            </div>
            <span className="font-display text-2xl font-bold text-white">DentistOS</span>
          </Link>
        </div>
        <div className="max-w-lg">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
            className="font-display text-4xl font-bold leading-tight text-white">
            Comece a transformar sua clínica hoje
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-white/60">
            Junte-se a mais de 1.200 dentistas que ja automatizaram suas agendas.
          </motion.p>
          <motion.ul initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-8 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00C9A7]">
                  <Check className="h-4 w-4 text-[#0A2540]" />
                </div>
                <span className="text-white/80">{benefit}</span>
              </li>
            ))}
          </motion.ul>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-white/80">&ldquo;Minha produtividade aumentou 40% desde que comecei a usar o DentistOS.&rdquo;</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00C9A7] font-semibold text-[#0A2540]">CE</div>
            <div>
              <div className="font-medium text-white">Dr. Carlos Eduardo</div>
              <div className="text-sm text-white/50">Implantodontista - MG</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#00C9A7]">
                <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5 text-[#0A2540]" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2C8 2 6 6 6 10c0 3 1 5 2 7s2 5 4 5 3-3 4-5 2-4 2-7c0-4-2-8-6-8z" />
                </svg>
              </div>
              <span className="font-display text-xl font-bold text-[#0A2540]">DentistOS</span>
            </Link>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h2 className="font-display text-3xl font-bold text-[#0A2540]">Criar sua conta</h2>
            <p className="mt-2 text-gray-600">
              Ja tem uma conta?{" "}
              <Link href="/login" className="font-medium text-[#00C9A7] hover:underline">Fazer login</Link>
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="mt-8">
            <Button variant="outline" onClick={handleGoogle} className="w-full gap-3 border-gray-200 py-6">
              <Chrome className="h-5 w-5" />
              Continuar com Google
            </Button>
          </motion.div>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
            <div className="relative flex justify-center text-sm"><span className="bg-white px-4 text-gray-500">ou</span></div>
          </div>

          {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

          <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="nome">Seu nome</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input id="nome" type="text" placeholder="Dr(a). Seu Nome" className="pl-10" required value={form.nome} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="clínica">Nome da clínica</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input id="clínica" type="text" placeholder="Clínica Sorriso Perfeito" className="pl-10" required value={form.clínica} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input id="email" type="email" placeholder="seu@email.com" className="pl-10" required value={form.email} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefone">Telefone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input id="telefone" type="tel" placeholder="(11) 99999-9999" className="pl-10" required value={form.telefone} onChange={handleChange} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <Input id="password" type="password" placeholder="Mínimo 8 caracteres" className="pl-10" required minLength={8} value={form.password} onChange={handleChange} />
              </div>
            </div>
            <div className="flex items-start gap-2">
              <Checkbox id="terms" className="mt-1" required />
              <Label htmlFor="terms" className="text-sm font-normal text-gray-600">
                Concordo com os{" "}
                <a href="#" className="text-[#00C9A7] hover:underline">Termos de Uso</a>{" "}e{" "}
                <a href="#" className="text-[#00C9A7] hover:underline">Politica de Privacidade</a>
              </Label>
            </div>
            <Button type="submit" disabled={isLoading} className="w-full gap-2 bg-[#00C9A7] py-6 text-[#0A2540] hover:bg-[#00C9A7]/90">
              {isLoading ? "Criando conta..." : (<>Criar conta gratis <ArrowRight className="h-4 w-4" /></>)}
            </Button>
          </motion.form>
        </div>
      </div>
    </div>
  )
}
