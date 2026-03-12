"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, User, FileText, Calendar, Plus, Clock, Save, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const toothStatusMap: Record<string, { color: string; bg: string; label: string }> = {
  saudavel:  { color: "border-emerald-400", bg: "bg-emerald-100", label: "Saudável" },
  tratado:   { color: "border-blue-400",    bg: "bg-blue-100",    label: "Tratado" },
  carie:     { color: "border-amber-400",   bg: "bg-amber-100",   label: "Cárie" },
  extracao:  { color: "border-red-400",     bg: "bg-red-100",     label: "Extração" },
  implante:  { color: "border-purple-400",  bg: "bg-purple-100",  label: "Implante" },
  coroa:     { color: "border-cyan-400",    bg: "bg-cyan-100",    label: "Coroa" },
}

const upperTeeth = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28]
const lowerTeeth = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38]

type Paciente = { id: string; nome: string; telefone: string; email?: string; data_nascimento?: string; convenio?: string }
type Dente = { id: string; numero_dente: number; status: string; observacoes?: string }
type Consulta = { id: string; data_hora: string; status: string; valor?: number; observacoes?: string; procedimentos_tipos?: { nome: string } }

export default function ProntuariosPage() {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const [pacienteSelecionado, setPacienteSelecionado] = useState<Paciente | null>(null)
  const [dentes, setDentes] = useState<Record<number, Dente>>({})
  const [consultas, setConsultas] = useState<Consulta[]>([])
  const [denteSelecionado, setDenteSelecionado] = useState<number | null>(null)
  const [loadingPaciente, setLoadingPaciente] = useState(false)
  const [isToothDialogOpen, setIsToothDialogOpen] = useState(false)
  const [novoStatus, setNovoStatus] = useState("saudavel")
  const [obsObservacao, setObsObservacao] = useState("")
  const [isAddProcOpen, setIsAddProcOpen] = useState(false)
  const [addProcForm, setAddProcForm] = useState({ procedimento_tipo_id: "", data: "", hora: "", valor: "", observacoes: "" })
  const [dentistId, setDentistId] = useState<string | null>(null)
  const [procedimentos, setProcedimentos] = useState<{id: string; nome: string; valor_padrao: number}[]>([])


  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  useEffect(() => { initTenant() }, [])

  async function initTenant() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from("profiles").select("tenant_id, id").eq("id", user.id).single()
    if (profile) {
      setTenantId(profile.tenant_id)
      setDentistId(profile.id)
      const { data } = await supabase.from("pacientes").select("id,nome,telefone,email,data_nascimento,convenio").eq("tenant_id", profile.tenant_id).order("nome")
      if (data) setPacientes(data)
      const { data: procs } = await supabase.from("procedimentos_tipos").select("id,nome,valor_padrao").eq("tenant_id", profile.tenant_id).eq("ativo", true)
      if (procs) setProcedimentos(procs)
    }
  }

  async function adicionarProcedimento() {
    const errors: Record<string, string> = {}
    if (!addProcForm.procedimento_tipo_id) errors.procedimento = "Selecione um procedimento"
    if (!addProcForm.data) errors.data = "Informe a data"
    if (!addProcForm.hora) errors.hora = "Informe o horário"
    if (Object.keys(errors).length > 0) { setFormErrors(errors); return }
    setFormErrors({})
    if (!pacienteSelecionado || !tenantId || !dentistId) return
    setSaving(true)
    const proc = procedimentos.find(p => p.id === addProcForm.procedimento_tipo_id)
    await supabase.from("consultas").insert({
      tenant_id: tenantId, paciente_id: pacienteSelecionado.id, dentista_id: dentistId,
      procedimento_tipo_id: addProcForm.procedimento_tipo_id || null,
      data_hora: `${addProcForm.data}T${addProcForm.hora}:00.000-03:00`,
      duracao_minutos: 30,
      valor: addProcForm.valor ? parseFloat(addProcForm.valor) : (proc?.valor_padrao || null),
      observacoes: addProcForm.observacoes || null, status: "concluida"
    })
    await selecionarPaciente(pacienteSelecionado)
    setIsAddProcOpen(false); setAddProcForm({ procedimento_tipo_id: "", data: "", hora: "", valor: "", observacoes: "" }); setFormErrors({}); setSaving(false)
  }

  async function selecionarPaciente(p: Paciente) {
    setPacienteSelecionado(p)
    setSearchQuery(p.nome)
    setShowDropdown(false)
    setDenteSelecionado(null)
    setLoadingPaciente(true)
    const { data: dentesData } = await supabase.from("dentes").select("*").eq("paciente_id", p.id)
    const dentesMap: Record<number, Dente> = {}
    if (dentesData) dentesData.forEach(d => { dentesMap[d.numero_dente] = d })
    setDentes(dentesMap)
    const { data: consultasData } = await supabase.from("consultas")
      .select("id,data_hora,status,valor,observacoes,procedimentos_tipos(nome)")
      .eq("paciente_id", p.id).order("data_hora", { ascending: false })
    if (consultasData) setConsultas(consultasData)
    setLoadingPaciente(false)
  }

  function abrirDialogDente(num: number) {
    setDenteSelecionado(num)
    const dente = dentes[num]
    setNovoStatus(dente?.status || "saudavel")
    setObsObservacao(dente?.observacoes || "")
    setIsToothDialogOpen(true)
  }

  async function salvarDente() {
    if (!pacienteSelecionado || !denteSelecionado || !tenantId) return
    setSaving(true)
    const existing = dentes[denteSelecionado]
    if (existing) {
      await supabase.from("dentes").update({ status: novoStatus, observacoes: obsObservacao }).eq("id", existing.id)
    } else {
      await supabase.from("dentes").insert({ tenant_id: tenantId, paciente_id: pacienteSelecionado.id, numero_dente: denteSelecionado, status: novoStatus, observacoes: obsObservacao })
    }
    // Refetch dentes explicitamente para garantir atualização do odontograma
    const { data: dentesData } = await supabase.from("dentes").select("*").eq("paciente_id", pacienteSelecionado.id)
    const dentesMap: Record<number, Dente> = {}
    if (dentesData) dentesData.forEach(d => { dentesMap[d.numero_dente] = d })
    setDentes(dentesMap)
    setSaving(false); setSaved(true)
    setTimeout(() => { setSaved(false); setIsToothDialogOpen(false) }, 1200)
  }

  const filteredPacientes = pacientes.filter(p => p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || p.telefone.includes(searchQuery))

  function getToothStyle(num: number) {
    const s = dentes[num]?.status || "saudavel"
    return toothStatusMap[s] || toothStatusMap.saudavel
  }

  function calcIdade(dataNasc?: string) {
    if (!dataNasc) return null
    const diff = Date.now() - new Date(dataNasc).getTime()
    return Math.floor(diff / (1000*60*60*24*365.25))
  }


  return (
    <div className="flex flex-col" suppressHydrationWarning>
      <DashboardHeader title="Prontuários" />
      <div className="flex-1 p-4 lg:p-6">

        {/* Busca de paciente */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1 sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar paciente por nome ou telefone..."
                  value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setShowDropdown(true) }}
                  onFocus={() => setShowDropdown(true)} className="pl-9" />
                {showDropdown && searchQuery && (
                  <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-lg max-h-48 overflow-y-auto">
                    {filteredPacientes.slice(0,8).map(p => (
                      <button key={p.id} onClick={() => selecionarPaciente(p)}
                        className="flex w-full items-center gap-3 px-3 py-2 text-sm hover:bg-muted text-left">
                        <User className="h-4 w-4 text-muted-foreground shrink-0" />
                        <div><div className="font-medium">{p.nome}</div><div className="text-muted-foreground text-xs">{p.telefone}</div></div>
                      </button>
                    ))}
                    {filteredPacientes.length === 0 && <p className="px-3 py-2 text-sm text-muted-foreground">Nenhum paciente encontrado</p>}
                  </div>
                )}
              </div>
              {pacienteSelecionado && (
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A2540] font-semibold text-white text-sm">
                    {pacienteSelecionado.nome.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{pacienteSelecionado.nome}</div>
                    <div className="text-sm text-muted-foreground">{pacienteSelecionado.telefone}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {!pacienteSelecionado ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">Selecione um paciente</h3>
            <p className="mt-2 text-sm text-muted-foreground">Busque o paciente acima para ver o prontuario e odontograma</p>
          </div>
        ) : loadingPaciente ? (
          <p className="py-12 text-center text-muted-foreground">Carregando prontuario...</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">

            {/* Odontograma */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-lg">Odontograma</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(toothStatusMap).map(([k,v]) => (
                    <div key={k} className="flex items-center gap-1">
                      <div className={`h-3 w-3 rounded-sm ${v.bg} border ${v.color}`} />
                      <span className="text-xs text-muted-foreground">{v.label}</span>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-center text-sm font-medium text-muted-foreground">Arcada Superior</div>
                <div className="flex justify-center gap-1 flex-wrap">
                  {upperTeeth.map(num => { const s = getToothStyle(num); return (
                    <button key={num} onClick={() => abrirDialogDente(num)}
                      className={`relative flex h-12 w-8 flex-col items-center justify-center rounded-md border-2 transition-all hover:scale-110 ${s.bg} ${s.color} ${denteSelecionado===num ? "ring-2 ring-[#00C9A7] ring-offset-2" : ""}`}>
                      <span className="text-xs font-medium">{num}</span>
                    </button>
                  )})}
                </div>
                <div className="my-6 border-t-2 border-dashed border-muted" />
                <div className="flex justify-center gap-1 flex-wrap">
                  {lowerTeeth.map(num => { const s = getToothStyle(num); return (
                    <button key={num} onClick={() => abrirDialogDente(num)}
                      className={`relative flex h-12 w-8 flex-col items-center justify-center rounded-md border-2 transition-all hover:scale-110 ${s.bg} ${s.color} ${denteSelecionado===num ? "ring-2 ring-[#00C9A7] ring-offset-2" : ""}`}>
                      <span className="text-xs font-medium">{num}</span>
                    </button>
                  )})}
                </div>
                <div className="mt-2 text-center text-sm font-medium text-muted-foreground">Arcada Inferior</div>
                <p className="mt-4 text-center text-xs text-muted-foreground">Clique em qualquer dente para alterar o status</p>
              </CardContent>
            </Card>


            {/* Sidebar info paciente */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Informacoes</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div><div className="text-sm text-muted-foreground">Nome</div><div className="font-medium">{pacienteSelecionado.nome}</div></div>
                </div>
                {pacienteSelecionado.data_nascimento && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-sm text-muted-foreground">Nascimento</div>
                      <div className="font-medium">{new Date(pacienteSelecionado.data_nascimento+"T12:00:00").toLocaleDateString("pt-BR")} — {calcIdade(pacienteSelecionado.data_nascimento)} anos</div>
                    </div>
                  </div>
                )}
                {consultas[0] && (
                  <div className="flex items-center gap-3">
                    <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div>
                      <div className="text-sm text-muted-foreground">Ultima visita</div>
                      <div className="font-medium">{new Date(consultas[0].data_hora).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>
                )}
                {pacienteSelecionado.convenio && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div><div className="text-sm text-muted-foreground">Convenio</div><div className="font-medium capitalize">{pacienteSelecionado.convenio}</div></div>
                  </div>
                )}
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Resumo do odontograma</div>
                  {Object.entries(toothStatusMap).filter(([k]) => k !== "saudavel").map(([k, v]) => {
                    const count = Object.values(dentes).filter(d => d.status === k).length
                    if (!count) return null
                    return <div key={k} className="flex justify-between text-sm py-0.5"><span className="text-muted-foreground">{v.label}</span><span className="font-semibold">{count}</span></div>
                  })}
                  {Object.values(dentes).filter(d => d.status !== "saudavel").length === 0 && (
                    <p className="text-xs text-muted-foreground">Todos os dentes saudaveis</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Historico de consultas */}
        {pacienteSelecionado && !loadingPaciente && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Historico de Consultas</CardTitle>
              {pacienteSelecionado && (
                <Button size="sm" className="gap-2 bg-[#00C9A7] text-[#0A2540]" onClick={() => setIsAddProcOpen(true)}>
                  <Plus className="h-4 w-4" /> Adicionar procedimento
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {consultas.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-3 text-muted-foreground">Nenhuma consulta registrada para este paciente</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {consultas.map(c => (
                    <div key={c.id} className="flex items-start justify-between rounded-lg border p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted shrink-0">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <div className="font-medium">{(c.procedimentos_tipos as any)?.nome || "Consulta"}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(c.data_hora).toLocaleDateString("pt-BR")} as {new Date(c.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          {c.observacoes && <div className="mt-1 text-sm text-muted-foreground">{c.observacoes}</div>}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {c.valor && <div className="font-semibold text-[#00C9A7]">R$ {Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>}
                        <Badge variant="outline" className={`mt-1 ${c.status === "concluida" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : c.status === "faltou" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                          {c.status === "concluida" ? "Concluida" : c.status === "faltou" ? "Faltou" : c.status === "confirmada" ? "Confirmada" : "Agendada"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialog alterar status do dente */}
        <Dialog open={isToothDialogOpen} onOpenChange={setIsToothDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Dente {denteSelecionado}</DialogTitle>
              <DialogDescription>Altere o status e adicione observações para este dente</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(toothStatusMap).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Observacoes</Label>
                <Input placeholder="Ex: Restauração em resina, implante Nobel..." value={obsObservacao} onChange={e => setObsObservacao(e.target.value)} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsToothDialogOpen(false)}>Cancelar</Button>
              <Button disabled={saving} className="bg-[#00C9A7] text-[#0A2540]" onClick={salvarDente}>
                {saved ? <><CheckCircle2 className="mr-2 h-4 w-4" />Salvo!</> : saving ? "Salvando..." : <><Save className="mr-2 h-4 w-4" />Salvar</>}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog: Adicionar procedimento */}
        <Dialog open={isAddProcOpen} onOpenChange={setIsAddProcOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar procedimento</DialogTitle>
              <DialogDescription>Registre um procedimento ou consulta realizada para {pacienteSelecionado?.nome}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Procedimento</Label>
                <Select value={addProcForm.procedimento_tipo_id} onValueChange={v => {
                  const proc = procedimentos.find(p => p.id === v)
                  setAddProcForm(f => ({...f, procedimento_tipo_id: v, valor: proc?.valor_padrao?.toString() || ""}))
                  setFormErrors(e => ({...e, procedimento: ""}))
                }}>
                  <SelectTrigger className={formErrors.procedimento ? "border-red-500" : ""}><SelectValue placeholder="Selecionar procedimento" /></SelectTrigger>
                  <SelectContent>
                    {procedimentos.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
                {formErrors.procedimento && <p className="text-xs text-red-500">{formErrors.procedimento}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Data *</Label>
                  <Input type="date" value={addProcForm.data} onChange={e => { setAddProcForm(f => ({...f, data: e.target.value})); setFormErrors(er => ({...er, data: ""})) }} className={formErrors.data ? "border-red-500" : ""} />
                  {formErrors.data && <p className="text-xs text-red-500">{formErrors.data}</p>}
                </div>
                <div className="grid gap-2">
                  <Label>Horário *</Label>
                  <Input type="time" value={addProcForm.hora} onChange={e => { setAddProcForm(f => ({...f, hora: e.target.value})); setFormErrors(er => ({...er, hora: ""})) }} className={formErrors.hora ? "border-red-500" : ""} />
                  {formErrors.hora && <p className="text-xs text-red-500">{formErrors.hora}</p>}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Valor (R$)</Label>
                <Input type="number" placeholder="0.00" value={addProcForm.valor} onChange={e => setAddProcForm(f => ({...f, valor: e.target.value}))} />
              </div>
              <div className="grid gap-2">
                <Label>Observações</Label>
                <Input placeholder="Detalhes do procedimento..." value={addProcForm.observacoes} onChange={e => setAddProcForm(f => ({...f, observacoes: e.target.value}))} />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsAddProcOpen(false)}>Cancelar</Button>
              <Button disabled={saving} className="bg-[#00C9A7] text-[#0A2540]" onClick={adicionarProcedimento}>
                {saving ? "Salvando..." : "Registrar procedimento"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
