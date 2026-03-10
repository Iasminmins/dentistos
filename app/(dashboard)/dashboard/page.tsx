"use client"

import { useEffect, useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle2, Clock, XCircle, TrendingUp, MessageCircle, RefreshCw, DollarSign } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export default function DashboardPage() {
  const supabase = createClient()
  const [stats, setStats] = useState({ total: 0, confirmadas: 0, pendentes: 0, faltas: 0 })
  const [consultas, setConsultas] = useState<any[]>([])
  const [transacoes, setTransacoes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: profile } = await supabase
        .from("profiles").select("tenant_id").eq("id", user.id).single()
      if (!profile) return

      const tenantId = profile.tenant_id
      const hoje = new Date()
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).toISOString()
      const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1).toISOString()

      // Consultas de hoje
      const { data: consultasHoje } = await supabase
        .from("consultas")
        .select("*, pacientes(nome, telefone), procedimentos_tipos(nome)")
        .eq("tenant_id", tenantId)
        .gte("data_hora", inicioHoje)
        .lt("data_hora", fimHoje)
        .order("data_hora", { ascending: true })

      if (consultasHoje) {
        setConsultas(consultasHoje)
        setStats({
          total: consultasHoje.length,
          confirmadas: consultasHoje.filter((c: any) => c.status === "confirmada").length,
          pendentes: consultasHoje.filter((c: any) => c.status === "agendada").length,
          faltas: consultasHoje.filter((c: any) => c.status === "faltou").length,
        })
      }

      // Lançamentos recentes
      const { data: lancamentos } = await supabase
        .from("lancamentos_financeiros")
        .select("*, pacientes(nome)")
        .eq("tenant_id", tenantId)
        .order("created_at", { ascending: false })
        .limit(3)

      if (lancamentos) setTransacoes(lancamentos)
      setLoading(false)
    }
    load()
  }, [])

  const statsCards = [
    { label: "Consultas hoje", value: stats.total, icon: Calendar, color: "bg-blue-500", change: "agendadas", changeType: "neutral" },
    { label: "Confirmadas", value: stats.confirmadas, icon: CheckCircle2, color: "bg-emerald-500", change: stats.total > 0 ? `${Math.round((stats.confirmadas / stats.total) * 100)}%` : "0%", changeType: "neutral" },
    { label: "Pendentes", value: stats.pendentes, icon: Clock, color: "bg-amber-500", change: "aguardando", changeType: "warning" },
    { label: "Faltas hoje", value: stats.faltas, icon: XCircle, color: "bg-red-500", change: "registradas", changeType: "neutral" },
  ]

  const formatHour = (iso: string) => new Date(iso).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Início" subtitle="Visão geral do seu dia" />
      <div className="flex-1 p-4 lg:p-6">

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-3xl font-bold">{loading ? "..." : stat.value}</p>
                    <p className={`mt-1 text-xs ${stat.changeType === "warning" ? "text-amber-600" : "text-muted-foreground"}`}>
                      {stat.change}
                    </p>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Consultas de hoje */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Consultas de hoje</CardTitle>
              <Link href="/dashboard/agenda">
                <Button variant="outline" size="sm">Ver agenda completa</Button>
              </Link>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="py-8 text-center text-muted-foreground">Carregando...</p>
              ) : consultas.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-muted-foreground">Nenhuma consulta agendada para hoje</p>
                  <Link href="/dashboard/agenda">
                    <Button className="mt-4 bg-[#00C9A7] text-[#0A2540]">Agendar consulta</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {consultas.map((apt) => (
                    <div key={apt.id} className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
                      <div className="flex items-center gap-4">
                        <div className="text-lg font-bold text-foreground">{formatHour(apt.data_hora)}</div>
                        <div className="h-10 w-px bg-border" />
                        <div>
                          <div className="font-medium">{apt.pacientes?.nome || "Paciente"}</div>
                          <div className="text-sm text-muted-foreground">{apt.procedimentos_tipos?.nome || "Consulta"}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={apt.status === "confirmada" ? "bg-emerald-100 text-emerald-700" : apt.status === "faltou" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}>
                          {apt.status === "confirmada" ? "Confirmado" : apt.status === "faltou" ? "Faltou" : "Pendente"}
                        </Badge>
                        <Button variant="ghost" size="icon"><MessageCircle className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sidebar direita */}
          <div className="space-y-6">
            {/* Alertas */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Alertas</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {consultas.filter(c => c.status === "agendada").slice(0, 2).map((c) => (
                  <div key={c.id} className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-100">
                      <Clock className="h-4 w-4 text-amber-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-amber-800">{c.pacientes?.nome} ainda não confirmou</p>
                      <Button variant="link" className="h-auto p-0 text-xs text-amber-700">Reenviar lembrete</Button>
                    </div>
                  </div>
                ))}
                {consultas.filter(c => c.status === "agendada").length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-2">Nenhum alerta no momento</p>
                )}
              </CardContent>
            </Card>

            {/* Movimentacoes */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg">Movimentações</CardTitle>
                <TrendingUp className="h-5 w-5 text-emerald-500" />
              </CardHeader>
              <CardContent className="space-y-4">
                {loading ? (
                  <p className="text-sm text-muted-foreground text-center">Carregando...</p>
                ) : transacoes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center">Nenhum lançamento ainda</p>
                ) : (
                  transacoes.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                          <DollarSign className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{tx.pacientes?.nome || tx.descricao}</p>
                          <p className="text-xs text-muted-foreground">{tx.categoria}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R$ {Number(tx.valor).toLocaleString("pt-BR")}</p>
                        <Badge variant="outline" className={tx.status === "pago" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                          {tx.status === "pago" ? "Pago" : "Pendente"}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
                <Link href="/dashboard/financeiro">
                  <Button variant="outline" className="w-full">Ver financeiro completo</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
