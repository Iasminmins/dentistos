"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Bell, Plus, Search, Menu, Calendar, Clock, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface DashboardHeaderProps {
  title: string
  subtitle?: string
  onMenuClick?: () => void
  onNovaConsulta?: () => void
}

type Notif = { id: string; tipo: string; texto: string; hora: string; lida: boolean }

export function DashboardHeader({ title, subtitle, onMenuClick, onNovaConsulta }: DashboardHeaderProps) {
  const router = useRouter()
  const [showNotif, setShowNotif] = useState(false)
  const [notifs, setNotifs] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)
  const notifRef = useRef<HTMLDivElement>(null)

  const today = new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }).replace(/\b([A-Z])/g, m => m.toLowerCase())

  useEffect(() => { loadNotifs() }, [])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false)
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  async function loadNotifs() {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()
    if (!profile) return

    const hoje = new Date().toISOString().split("T")[0]
    const amanha = new Date(Date.now() + 86400000).toISOString().split("T")[0]

    const { data: consultas } = await supabase.from("consultas")
      .select("id, data_hora, status, pacientes(nome)")
      .eq("tenant_id", profile.tenant_id)
      .gte("data_hora", hoje)
      .lte("data_hora", amanha + "T23:59:59")
      .order("data_hora", { ascending: true })
      .limit(8)

    if (!consultas) return

    const lista: Notif[] = consultas.map(c => {
      const dt = new Date(c.data_hora)
      const nome = (c.pacientes as any)?.nome || "Paciente"
      const hora = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
      const isHoje = dt.toISOString().split("T")[0] === hoje

      return {
        id: c.id,
        tipo: c.status === "agendada" ? "agendada" : "confirmada",
        texto: `${nome} — ${isHoje ? "hoje" : "amanhã"} às ${hora}`,
        hora: isHoje ? `Hoje ${hora}` : `Amanhã ${hora}`,
        lida: c.status === "concluída" || c.status === "faltou",
      }
    })

    setNotifs(lista)
    setUnread(lista.filter(n => !n.lida).length)
  }

  function handleNovaConsulta() {
    if (onNovaConsulta) { onNovaConsulta() }
    else { router.push("/dashboard/agenda?nova=1") }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          {/* Espaço para o botão hamburger no mobile */}
          <div className="w-10 lg:hidden" />
          <div>
            <h1 className="font-display text-xl font-bold text-foreground lg:text-2xl">{title}</h1>
            <p className="hidden text-sm text-muted-foreground capitalize lg:block">{subtitle || today}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative hidden lg:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar paciente..." className="w-64 pl-9" />
          </div>

          {/* Sino de notificacoes */}
          <div ref={notifRef} className="relative">
            <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNotif(v => !v)}>
              <Bell className="h-5 w-5" />
              {unread > 0 && (
                <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#00C9A7] text-[10px] font-bold text-[#0A2540]">
                  {unread}
                </span>
              )}
            </Button>

            {showNotif && (
              <div className="absolute right-0 top-12 z-50 w-80 rounded-xl border bg-background shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                  <span className="font-semibold">Consultas de hoje e amanhã</span>
                  <button onClick={() => setShowNotif(false)}><X className="h-4 w-4 text-muted-foreground" /></button>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {notifs.length === 0 ? (
                    <p className="px-4 py-6 text-center text-sm text-muted-foreground">Nenhuma consulta nas próximas 24h</p>
                  ) : notifs.map(n => (
                    <div key={n.id} className={`flex items-start gap-3 border-b px-4 py-3 last:border-0 ${n.lida ? "opacity-50" : ""}`}>
                      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${n.tipo === "confirmada" ? "bg-emerald-100" : "bg-amber-100"}`}>
                        <Calendar className={`h-4 w-4 ${n.tipo === "confirmada" ? "text-emerald-600" : "text-amber-600"}`} />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{n.texto}</p>
                        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />{n.hora}
                        </div>
                      </div>
                      <Badge variant="outline" className={`shrink-0 text-xs ${n.tipo === "confirmada" ? "border-emerald-200 text-emerald-700" : "border-amber-200 text-amber-700"}`}>
                        {n.tipo === "confirmada" ? "Confirmada" : "Agendada"}
                      </Badge>
                    </div>
                  ))}
                </div>
                <div className="border-t px-4 py-2">
                  <button onClick={() => { router.push("/dashboard/agenda"); setShowNotif(false) }}
                    className="w-full rounded-lg py-2 text-center text-sm font-medium text-[#00C9A7] hover:bg-muted">
                    Ver agenda completa →
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button onClick={handleNovaConsulta} className="gap-2 bg-[#00C9A7] text-[#0A2540] hover:bg-[#00C9A7]/90">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Nova consulta</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
