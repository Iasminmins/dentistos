"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChevronLeft, ChevronRight, Plus, Clock, User, FileText, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const timeSlots = ["08:00","09:00","10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00"]
const weekDays = ["Seg","Ter","Qua","Qui","Sex","Sab"]

type Consulta = { id: string; data_hora: string; status: string; duracao_minutos: number; observacoes?: string; valor?: number; pacientes?: { nome: string; telefone: string }; procedimentos_tipos?: { nome: string } }
type Paciente = { id: string; nome: string; telefone: string }
type Procedimento = { id: string; nome: string; duracao_minutos: number; valor_padrao: number }
type ViewMode = "semana" | "dia" | "mes"

const emptyForm = { paciente_id: "", data: "", hora: "", procedimento_tipo_id: "", observacoes: "", valor: "" }

export default function AgendaPage() {
  const supabase = createClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<ViewMode>("semana")
  const [currentOffset, setCurrentOffset] = useState(0) // semanas ou dias
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [procedimentos, setProcedimentos] = useState<Procedimento[]>([])
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [dentistId, setDentistId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [searchPaciente, setSearchPaciente] = useState("")
  const [loading, setLoading] = useState(true)
  const [consultaSelecionada, setConsultaSelecionada] = useState<Consulta | null>(null)

  useEffect(() => { initialize() }, [])
  useEffect(() => { if (tenantId) loadConsultas() }, [tenantId, currentOffset, viewMode])
  useEffect(() => { if (searchParams.get("nova") === "1") { setIsOpen(true); router.replace("/dashboard/agenda") } }, [searchParams])

  async function initialize() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from("profiles").select("tenant_id, id").eq("id", user.id).single()
    if (!profile) return
    setTenantId(profile.tenant_id); setDentistId(profile.id)
    const { data: procs } = await supabase.from("procedimentos_tipos").select("*").eq("tenant_id", profile.tenant_id).eq("ativo", true)
    if (procs) setProcedimentos(procs)
    const { data: pacs } = await supabase.from("pacientes").select("id, nome, telefone").eq("tenant_id", profile.tenant_id).order("nome")
    if (pacs) setPacientes(pacs)
  }

  function getDayRange() {
    const d = new Date(); d.setDate(d.getDate() + currentOffset); d.setHours(0,0,0,0)
    const f = new Date(d); f.setHours(23,59,59,999)
    return { inicio: d.toISOString(), fim: f.toISOString(), dia: d }
  }

  function getWeekRange() {
    const today = new Date()
    const dow = today.getDay() === 0 ? 6 : today.getDay() - 1
    const seg = new Date(today); seg.setDate(today.getDate() - dow + currentOffset * 7); seg.setHours(0,0,0,0)
    const sab = new Date(seg); sab.setDate(seg.getDate() + 5); sab.setHours(23,59,59,999)
    return { inicio: seg.toISOString(), fim: sab.toISOString() }
  }

  function getMonthRange() {
    const today = new Date()
    const inicio = new Date(today.getFullYear(), today.getMonth() + currentOffset, 1)
    const fim = new Date(today.getFullYear(), today.getMonth() + currentOffset + 1, 0, 23, 59, 59)
    return { inicio: inicio.toISOString(), fim: fim.toISOString(), mes: inicio }
  }

  function getMonthDays() {
    const today = new Date()
    const ano = today.getFullYear()
    const mes = today.getMonth() + currentOffset
    const primeiroDia = new Date(ano, mes, 1)
    const ultimoDia = new Date(ano, mes + 1, 0)
    const days = []
    // pad início da semana (seg=0)
    const inicioSemana = primeiroDia.getDay() === 0 ? 6 : primeiroDia.getDay() - 1
    for (let i = 0; i < inicioSemana; i++) days.push(null)
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      days.push(new Date(ano, mes, d))
    }
    return days
  }

  function getConsultasDoMes(data: Date) {
    return consultas.filter(c => {
      const cd = new Date(c.data_hora)
      return cd.getDate() === data.getDate() && cd.getMonth() === data.getMonth() && cd.getFullYear() === data.getFullYear()
    })
  }

  async function loadConsultas() {
    if (!tenantId) return
    setLoading(true)
    const { inicio, fim } = viewMode === "dia" ? getDayRange() : viewMode === "mes" ? getMonthRange() : getWeekRange()
    const { data } = await supabase.from("consultas")
      .select("*, pacientes(nome, telefone), procedimentos_tipos(nome)")
      .eq("tenant_id", tenantId).gte("data_hora", inicio).lte("data_hora", fim)
    if (data) setConsultas(data)
    setLoading(false)
  }

  function getWeekDates() {
    const today = new Date()
    const dow = today.getDay() === 0 ? 6 : today.getDay() - 1
    const seg = new Date(today); seg.setDate(today.getDate() - dow + currentOffset * 7)
    return weekDays.map((day, i) => {
      const d = new Date(seg); d.setDate(seg.getDate() + i)
      return { day, date: d.getDate(), full: d, isToday: d.toDateString() === today.toDateString() && currentOffset === 0 }
    })
  }

  function getConsultaForSlot(dayIndex: number, time: string) {
    const dates = getWeekDates()
    const dayDate = dates[dayIndex].full
    const [h] = time.split(":").map(Number)
    return consultas.find(c => {
      const cd = new Date(c.data_hora)
      return cd.getDate() === dayDate.getDate() && cd.getMonth() === dayDate.getMonth() && cd.getFullYear() === dayDate.getFullYear() && cd.getHours() === h
    })
  }

  function getDayConsultaForSlot(time: string) {
    const [h] = time.split(":").map(Number)
    return consultas.filter(c => new Date(c.data_hora).getHours() === h)
  }

  async function handleSave() {
    if (!form.paciente_id || !form.data || !form.hora || !tenantId || !dentistId) return
    setSaving(true)
    const proc = procedimentos.find(p => p.id === form.procedimento_tipo_id)
    await supabase.from("consultas").insert({
      tenant_id: tenantId, paciente_id: form.paciente_id, dentista_id: dentistId,
      procedimento_tipo_id: form.procedimento_tipo_id || null,
      data_hora: `${form.data}T${form.hora}:00`,
      duracao_minutos: proc?.duracao_minutos || 30,
      valor: form.valor ? parseFloat(form.valor) : (proc?.valor_padrao || null),
      observacoes: form.observacoes || null, status: "agendada"
    })
    await loadConsultas(); setIsOpen(false); setForm(emptyForm); setSaving(false)
  }

  async function updateStatus(id: string, status: string) {
    await supabase.from("consultas").update({ status }).eq("id", id)
    setConsultaSelecionada(null); await loadConsultas()
  }

  const weekDates = getWeekDates()
  const filteredPacientes = pacientes.filter(p => p.nome.toLowerCase().includes(searchPaciente.toLowerCase()))
  const statusColor = (s: string) => s === "confirmada" ? "border-emerald-500" : s === "faltou" ? "border-red-500" : s === "concluida" ? "border-blue-500" : "border-amber-500"
  const statusBg = (s: string) => s === "confirmada" ? "bg-emerald-50" : s === "faltou" ? "bg-red-50" : s === "concluida" ? "bg-blue-50" : "bg-amber-50"
  const { dia: diaAtual } = viewMode === "dia" ? getDayRange() : { dia: new Date() }
  const { mes: mesAtual } = viewMode === "mes" ? getMonthRange() : { mes: new Date() }

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Agenda" onNovaConsulta={() => setIsOpen(true)} />
      <div className="flex-1 p-4 lg:p-6">

        {/* Controles */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setCurrentOffset(o => o - 1)}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={() => setCurrentOffset(0)} className="min-w-36">
              {viewMode === "dia"
                ? currentOffset === 0 ? "Hoje" : diaAtual.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })
                : viewMode === "mes"
                ? mesAtual.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })
                : currentOffset === 0 ? "Esta semana" : currentOffset > 0 ? `+${currentOffset} sem.` : `${currentOffset} sem.`}
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentOffset(o => o + 1)}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            {/* Toggle Semana / Dia / Mês */}
            <div className="flex rounded-lg border overflow-hidden">
              <Button
                variant={viewMode === "semana" ? "default" : "ghost"}
                size="sm"
                className={`rounded-none px-4 ${viewMode === "semana" ? "bg-[#00C9A7] text-[#0A2540]" : ""}`}
                onClick={() => { setViewMode("semana"); setCurrentOffset(0) }}>
                Semana
              </Button>
              <Button
                variant={viewMode === "dia" ? "default" : "ghost"}
                size="sm"
                className={`rounded-none px-4 ${viewMode === "dia" ? "bg-[#00C9A7] text-[#0A2540]" : ""}`}
                onClick={() => { setViewMode("dia"); setCurrentOffset(0) }}>
                Dia
              </Button>
              <Button
                variant={viewMode === "mes" ? "default" : "ghost"}
                size="sm"
                className={`rounded-none px-4 ${viewMode === "mes" ? "bg-[#00C9A7] text-[#0A2540]" : ""}`}
                onClick={() => { setViewMode("mes"); setCurrentOffset(0) }}>
                Mês
              </Button>
            </div>
            <Button onClick={() => setIsOpen(true)} className="gap-2 bg-[#00C9A7] text-[#0A2540] hover:bg-[#00C9A7]/90">
              <Plus className="h-4 w-4" /> Nova consulta
            </Button>
          </div>
        </div>

        {/* Legenda */}
        <div className="mb-4 flex gap-4">
          {[["Agendada","bg-amber-500"],["Confirmada","bg-emerald-500"],["Concluída","bg-blue-500"],["Faltou","bg-red-500"]].map(([l,c]) => (
            <div key={l} className="flex items-center gap-2"><div className={`h-3 w-3 rounded-full ${c}`} /><span className="text-sm text-muted-foreground">{l}</span></div>
          ))}
        </div>

        {/* VIEW SEMANA */}
        {viewMode === "semana" && (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-[80px_repeat(6,1fr)] border-b">
                    <div className="border-r p-4" />
                    {weekDates.map((d, i) => (
                      <div key={i} className={`border-r p-4 text-center last:border-r-0 ${d.isToday ? "bg-[#00C9A7]/10" : ""}`}>
                        <div className="text-sm font-medium text-muted-foreground">{d.day}</div>
                        <div className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold ${d.isToday ? "bg-[#00C9A7] text-[#0A2540]" : ""}`}>{d.date}</div>
                      </div>
                    ))}
                  </div>
                  {timeSlots.map(time => (
                    <div key={time} className="grid grid-cols-[80px_repeat(6,1fr)] border-b last:border-b-0">
                      <div className="border-r p-2 text-center text-sm text-muted-foreground">{time}</div>
                      {weekDates.map((_, di) => {
                        const c = getConsultaForSlot(di, time)
                        return (
                          <div key={di} className={`relative min-h-[60px] border-r p-1 last:border-r-0 ${weekDates[di].isToday ? "bg-[#00C9A7]/5" : ""}`}>
                            {c && (
                              <div onClick={() => setConsultaSelecionada(c)}
                                className={`absolute inset-x-1 rounded-md border-l-4 bg-white p-2 shadow-sm cursor-pointer hover:shadow-md transition-shadow ${statusColor(c.status)}`}>
                                <div className="truncate text-sm font-medium">{c.pacientes?.nome}</div>
                                <div className="truncate text-xs text-muted-foreground">{c.procedimentos_tipos?.nome || "Consulta"}</div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* VIEW DIA */}
        {viewMode === "dia" && (
          <Card>
            <CardContent className="p-0">
              <div className="border-b px-6 py-4">
                <h2 className="font-semibold text-lg">
                  {diaAtual.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" })}
                </h2>
                <p className="text-sm text-muted-foreground">{consultas.length} consulta{consultas.length !== 1 ? "s" : ""} agendada{consultas.length !== 1 ? "s" : ""}</p>
              </div>
              <div>
                {timeSlots.map(time => {
                  const slots = getDayConsultaForSlot(time)
                  return (
                    <div key={time} className="flex border-b last:border-b-0 min-h-[70px]">
                      <div className="w-20 shrink-0 border-r p-3 text-center text-sm font-medium text-muted-foreground">{time}</div>
                      <div className="flex-1 p-2 flex flex-col gap-2">
                        {slots.map(c => (
                          <div key={c.id} onClick={() => setConsultaSelecionada(c)}
                            className={`flex items-center justify-between rounded-lg border-l-4 ${statusColor(c.status)} ${statusBg(c.status)} p-3 cursor-pointer hover:shadow-sm transition-shadow`}>
                            <div>
                              <p className="font-medium text-sm">{c.pacientes?.nome}</p>
                              <p className="text-xs text-muted-foreground">{c.procedimentos_tipos?.nome || "Consulta"} · {c.duracao_minutos}min</p>
                            </div>
                            <Badge variant="outline" className="text-xs capitalize">{c.status}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* VIEW MÊS */}
        {viewMode === "mes" && (
          <Card>
            <CardContent className="p-4">
              {/* Cabeçalho dos dias da semana */}
              <div className="grid grid-cols-7 mb-2">
                {["Seg","Ter","Qua","Qui","Sex","Sáb","Dom"].map(d => (
                  <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground uppercase">{d}</div>
                ))}
              </div>
              {/* Grid dos dias */}
              <div className="grid grid-cols-7 gap-1">
                {getMonthDays().map((date, i) => {
                  if (!date) return <div key={`empty-${i}`} />
                  const hoje = new Date()
                  const isToday = date.toDateString() === hoje.toDateString()
                  const consultasDia = getConsultasDoMes(date)
                  return (
                    <div key={date.toISOString()}
                      className={`min-h-[80px] rounded-lg border p-1.5 transition-colors hover:bg-muted/50 cursor-pointer ${isToday ? "border-[#00C9A7] bg-[#00C9A7]/5" : "border-border"}`}>
                      <div className={`mb-1 flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${isToday ? "bg-[#00C9A7] text-[#0A2540]" : "text-foreground"}`}>
                        {date.getDate()}
                      </div>
                      <div className="space-y-0.5">
                        {consultasDia.slice(0, 3).map(c => (
                          <div key={c.id} onClick={() => setConsultaSelecionada(c)}
                            className={`truncate rounded px-1 py-0.5 text-[10px] font-medium border-l-2 ${statusColor(c.status)} ${statusBg(c.status)}`}>
                            {new Date(c.data_hora).toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"})} {c.pacientes?.nome?.split(" ")[0]}
                          </div>
                        ))}
                        {consultasDia.length > 3 && (
                          <div className="text-[10px] text-muted-foreground pl-1">+{consultasDia.length - 3} mais</div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dialog: Detalhe da Consulta */}
        <Dialog open={!!consultaSelecionada} onOpenChange={() => setConsultaSelecionada(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Detalhes da Consulta</DialogTitle>
              <DialogDescription>Visualize e atualize o status da consulta</DialogDescription>
            </DialogHeader>
            {consultaSelecionada && (
              <div className="space-y-4 py-2">
                <div className="rounded-lg bg-muted p-4 space-y-2">
                  <p className="font-semibold">{consultaSelecionada.pacientes?.nome}</p>
                  <p className="text-sm text-muted-foreground">{consultaSelecionada.procedimentos_tipos?.nome || "Consulta"}</p>
                  <p className="text-sm">{new Date(consultaSelecionada.data_hora).toLocaleString("pt-BR")}</p>
                  {consultaSelecionada.observacoes && <p className="text-sm italic">"{consultaSelecionada.observacoes}"</p>}
                </div>
                <div>
                  <Label className="mb-2 block">Alterar status</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {[["agendada","Agendada","bg-amber-500"],["confirmada","Confirmada","bg-emerald-500"],["concluida","Concluída","bg-blue-500"],["faltou","Faltou","bg-red-500"]].map(([val, label, color]) => (
                      <button key={val} onClick={() => updateStatus(consultaSelecionada.id, val)}
                        className={`flex items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm font-medium transition-all hover:opacity-80 ${consultaSelecionada.status === val ? "border-current bg-muted" : "border-transparent bg-muted/40"}`}>
                        <div className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}
                        {consultaSelecionada.status === val && <span className="ml-auto text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Dialog: Nova Consulta */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Agendar nova consulta</DialogTitle>
              <DialogDescription>Preencha os dados para criar um novo agendamento</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Paciente *</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Buscar paciente..." className="pl-9" value={searchPaciente}
                    onChange={e => setSearchPaciente(e.target.value)} />
                </div>
                {searchPaciente && (
                  <div className="max-h-40 overflow-y-auto rounded-md border bg-background shadow-md">
                    {filteredPacientes.slice(0, 8).map(p => (
                      <button key={p.id} className="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                        onClick={() => { setForm({...form, paciente_id: p.id}); setSearchPaciente(p.nome) }}>
                        <User className="h-4 w-4 text-muted-foreground" /> {p.nome}
                      </button>
                    ))}
                    {filteredPacientes.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum paciente encontrado</p>}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data *</Label>
                  <Input type="date" value={form.data} onChange={e => setForm({...form, data: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Horário *</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input type="time" className="pl-9" value={form.hora} onChange={e => setForm({...form, hora: e.target.value})} />
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Procedimento</Label>
                <Select value={form.procedimento_tipo_id} onValueChange={v => {
                  const proc = procedimentos.find(p => p.id === v)
                  setForm({...form, procedimento_tipo_id: v, valor: proc?.valor_padrao?.toString() || ""})
                }}>
                  <SelectTrigger><SelectValue placeholder="Selecionar procedimento" /></SelectTrigger>
                  <SelectContent>
                    {procedimentos.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Valor (R$)</Label>
                <Input type="number" placeholder="0.00" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Observações</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Observações..." className="pl-9" value={form.observacoes} onChange={e => setForm({...form, observacoes: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => { setIsOpen(false); setForm(emptyForm); setSearchPaciente("") }}>Cancelar</Button>
              <Button disabled={saving || !form.paciente_id || !form.data || !form.hora}
                className="bg-[#00C9A7] text-[#0A2540]" onClick={handleSave}>
                {saving ? "Agendando..." : "Agendar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
