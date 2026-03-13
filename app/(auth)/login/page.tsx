"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Mail, Lock, ArrowRight, Chrome } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showMagicLink, setShowMagicLink] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [magicSent, setMagicSent] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (showMagicLink) {
        const { error } = await supabase.auth.signInWithOtp({ email })
        if (error) throw error
        setMagicSent(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        router.push("/dashboard")
        router.refresh()
      }
    } catch (err: any) {
      setError(err.message || "Erro ao fazer login. Tente novamente.")
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

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
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
            Bem-vindo de volta!
          </motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-4 text-lg text-white/60">
            Sua clínica esta esperando. Acesse o dashboard e veja como sua agenda esta hoje.
          </motion.p>
        </div>
        <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
          <p className="text-white/80">&ldquo;O DentistOS transformou a forma como gerencio minha clínica.&rdquo;</p>
          <div className="mt-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#00C9A7] font-semibold text-[#0A2540]">MF</div>
            <div>
              <div className="font-medium text-white">Dra. Maria Fernanda</div>
              <div className="text-sm text-white/50">Ortodontista - SP</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
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
            <h2 className="font-display text-3xl font-bold text-[#0A2540]">Entrar na sua conta</h2>
            <p className="mt-2 text-gray-600">
              Não tem uma conta?{" "}
              <Link href="/cadastro" className="font-medium text-[#00C9A7] hover:underline">Criar conta gratis</Link>
            </p>
          </motion.div>

          {magicSent ? (
            <div className="mt-8 rounded-xl bg-[#00C9A7]/10 p-6 text-center">
              <p className="font-medium text-[#0A2540]">✅ Link enviado!</p>
              <p className="mt-2 text-sm text-gray-600">Verifique seu email <strong>{email}</strong> e clique no link para entrar.</p>
            </div>
          ) : (
            <>
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

              <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
                <button onClick={() => setShowMagicLink(false)}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${!showMagicLink ? "bg-white text-[#0A2540] shadow-sm" : "text-gray-600"}`}>
                  Senha
                </button>
                <button onClick={() => setShowMagicLink(true)}
                  className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${showMagicLink ? "bg-white text-[#0A2540] shadow-sm" : "text-gray-600"}`}>
                  Magic Link
                </button>
              </div>

              {error && <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

              <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}
                onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                    <Input id="email" type="email" placeholder="seu@email.com" className="pl-10" required
                      value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                {!showMagicLink && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Senha</Label>
                      <Link href="/recuperar-senha" className="text-sm text-[#00C9A7] hover:underline">Esqueceu a senha?</Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input id="password" type="password" placeholder="********" className="pl-10" required
                        value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                  </div>
                )}

                {!showMagicLink && (
                  <div className="flex items-center gap-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm font-normal">Manter conectado</Label>
                  </div>
                )}

                <Button type="submit" disabled={isLoading}
                  className="w-full gap-2 bg-[#0A2540] py-6 text-white hover:bg-[#0A2540]/90">
                  {isLoading ? "Entrando..." : showMagicLink ? (<>Enviar link magico <ArrowRight className="h-4 w-4" /></>) : (<>Entrar <ArrowRight className="h-4 w-4" /></>)}
                </Button>
              </motion.form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
