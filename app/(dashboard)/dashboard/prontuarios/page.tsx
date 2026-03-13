"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, User, FileText, Calendar, Plus, Clock, Save, CheckCircle2, Printer } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

const STATUS: Record<string, { border: string; bg: string; label: string }> = {
  saudavel: { border: "#34d399", bg: "#d1fae5", label: "Saudável" },
  tratado:  { border: "#60a5fa", bg: "#dbeafe", label: "Tratado" },
  carie:    { border: "#fbbf24", bg: "#fef3c7", label: "Cárie" },
  extracao: { border: "#f87171", bg: "#fee2e2", label: "Extração" },
  implante: { border: "#c084fc", bg: "#f3e8ff", label: "Implante" },
  coroa:    { border: "#22d3ee", bg: "#cffafe", label: "Coroa" },
}

const upperTeeth = [18,17,16,15,14,13,12,11,21,22,23,24,25,26,27,28]
const lowerTeeth = [48,47,46,45,44,43,42,41,31,32,33,34,35,36,37,38]

type Paciente = { id: string; nome: string; telefone: string; email?: string; data_nascimento?: string; convenio?: string }
type Dente = { id: string; número_dente: number; status: string; observacoes?: string }
type Consulta = { id: string; data_hora: string; status: string; valor?: number; observacoes?: string; procedimentos_tipos?: { nome: string } }

export default function ProntuariosPage() {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [dentistId, setDentistId] = useState<string | null>(null)
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
  const [procedimentos, setProcedimentos] = useState<{id: string; nome: string; valor_padrao: number}[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})

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

  async function selecionarPaciente(p: Paciente) {
    setPacienteSelecionado(p)
    setSearchQuery(p.nome)
    setShowDropdown(false)
    setDenteSelecionado(null)
    setLoadingPaciente(true)
    const { data: dentesData } = await supabase.from("dentes").select("*").eq("paciente_id", p.id)
    const map: Record<number, Dente> = {}
    if (dentesData) dentesData.forEach(d => { map[d.número_dente] = d })
    setDentes(map)
    const { data: consultasData } = await supabase.from("consultas")
      .select("id,data_hora,status,valor,observacoes,procedimentos_tipos(nome)")
      .eq("paciente_id", p.id).order("data_hora", { ascending: false })
    if (consultasData) setConsultas(consultasData)
    setLoadingPaciente(false)
  }

  function abrirDialogDente(num: number) {
    setDenteSelecionado(num)
    setNovoStatus(dentes[num]?.status || "saudavel")
    setObsObservacao(dentes[num]?.observacoes || "")
    setIsToothDialogOpen(true)
  }

  async function salvarDente() {
    if (!pacienteSelecionado || !denteSelecionado || !tenantId) return
    setSaving(true)

    // ✅ ATUALIZAÇÃO OTIMISTA: muda a cor imediatamente sem esperar o banco
    setDentes(prev => ({
      ...prev,
      [denteSelecionado]: {
        ...(prev[denteSelecionado] || { id: "", número_dente: denteSelecionado }),
        status: novoStatus,
        observacoes: obsObservacao,
      } as Dente
    }))

    const existing = dentes[denteSelecionado]
    if (existing) {
      await supabase.from("dentes").update({ status: novoStatus, observacoes: obsObservacao }).eq("id", existing.id)
    } else {
      const { data: inserted } = await supabase.from("dentes").insert({
        tenant_id: tenantId, paciente_id: pacienteSelecionado.id,
        número_dente: denteSelecionado, status: novoStatus, observacoes: obsObservacao
      }).select().single()
      // Atualiza com o ID real retornado pelo banco
      if (inserted) {
        setDentes(prev => ({ ...prev, [denteSelecionado]: inserted }))
      }
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => { setSaved(false); setIsToothDialogOpen(false) }, 900)
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
      observacoes: addProcForm.observacoes || null, status: "concluída"
    })
    await selecionarPaciente(pacienteSelecionado)
    setIsAddProcOpen(false)
    setAddProcForm({ procedimento_tipo_id: "", data: "", hora: "", valor: "", observacoes: "" })
    setFormErrors({})
    setSaving(false)
  }

  function calcIdade(dataNasc?: string) {
    if (!dataNasc) return null
    return Math.floor((Date.now() - new Date(dataNasc).getTime()) / (1000*60*60*24*365.25))
  }

  function getStyle(num: number) {
    const s = dentes[num]?.status || "saudavel"
    return STATUS[s] || STATUS.saudavel
  }

  // ✅ FUNÇÃO DE IMPRESSÃO — abre janela com template profissional
  function imprimirProntuario() {
    if (!pacienteSelecionado) return
    const allTeeth = [...upperTeeth, ...lowerTeeth]
    const dentesHTML = allTeeth.map(num => {
      const st = getStyle(num)
      const obs = dentes[num]?.observacoes || ""
      return `<div class="tooth" style="background:${st.bg};border:2px solid ${st.border}">
        <span>${num}</span>${obs ? `<div class="tooth-obs">${obs}</div>` : ""}
      </div>`
    }).join("")

    const legendaHTML = Object.entries(STATUS).map(([, v]) =>
      `<span class="leg-item"><span class="leg-dot" style="background:${v.bg};border:2px solid ${v.border}"></span>${v.label}</span>`
    ).join("")

    const resumoHTML = Object.entries(STATUS).filter(([k]) => k !== "saudavel").map(([k, v]) => {
      const count = Object.values(dentes).filter(d => d.status === k).length
      return count > 0 ? `<tr><td>${v.label}</td><td><b>${count}</b></td></tr>` : ""
    }).join("")

    const consultasHTML = consultas.slice(0, 10).map(c => {
      const d = new Date(c.data_hora)
      const proc = (c.procedimentos_tipos as any)?.nome || "Consulta"
      const val = c.valor ? `R$ ${Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"
      const statusLabel = c.status === "concluída" ? "Concluída" : c.status === "faltou" ? "Faltou" : "Agendada"
      return `<tr><td>${d.toLocaleDateString("pt-BR")}</td><td>${proc}</td><td>${val}</td><td>${statusLabel}</td></tr>`
    }).join("")

    const clínicaNome = "DentistOS"
    const dataImpressao = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    const idade = calcIdade(pacienteSelecionado.data_nascimento)

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8">
<title>Prontuário — ${pacienteSelecionado.nome}</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #1a1a2e; background: #fff; padding: 32px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #0A2540; padding-bottom:16px; margin-bottom:24px; }
  .logo { display:flex; align-items:center; gap:10px; }
  .logo-icon { width:40px; height:40px; background:#00C9A7; border-radius:10px; display:flex; align-items:center; justify-content:center; }
  .logo-icon svg { width:24px; height:24px; stroke:#0A2540; fill:none; stroke-width:2; }
  .logo-name { font-size:22px; font-weight:800; color:#0A2540; }
  .header-right { text-align:right; font-size:12px; color:#666; }
  .title { font-size:13px; font-weight:700; text-transform:uppercase; letter-spacing:1px; color:#00C9A7; margin-bottom:4px; }
  .section { margin-bottom:28px; }
  .section-title { font-size:14px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; color:#0A2540; border-left:4px solid #00C9A7; padding-left:10px; margin-bottom:14px; }
  .info-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; }
  .info-box { background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:12px; }
  .info-label { font-size:11px; color:#888; margin-bottom:3px; text-transform:uppercase; letter-spacing:.5px; }
  .info-value { font-size:14px; font-weight:600; color:#1a1a2e; }
  .legenda { display:flex; flex-wrap:wrap; gap:10px; margin-bottom:14px; }
  .leg-item { display:flex; align-items:center; gap:5px; font-size:12px; }
  .leg-dot { width:14px; height:14px; border-radius:3px; display:inline-block; }
  .odonto-container { display:flex; flex-direction:column; gap:8px; align-items:center; }
  .arcada { display:flex; gap:4px; flex-wrap:wrap; justify-content:center; }
  .tooth { width:32px; height:38px; border-radius:6px; display:flex; flex-direction:column; align-items:center; justify-content:center; font-size:11px; font-weight:600; position:relative; }
  .tooth-obs { position:absolute; bottom:-1px; right:-1px; width:8px; height:8px; background:#f87171; border-radius:50%; }
  .divider { width:80%; border-top:1px dashed #ccc; margin:4px 0; }
  .arcada-label { font-size:11px; color:#888; font-weight:600; }
  table { width:100%; border-collapse:collapse; font-size:13px; }
  th { background:#0A2540; color:white; padding:8px 12px; text-align:left; font-size:11px; text-transform:uppercase; letter-spacing:.5px; }
  td { padding:8px 12px; border-bottom:1px solid #f0f0f0; }
  tr:last-child td { border-bottom:none; }
  tr:nth-child(even) td { background:#f8fafc; }
  .resumo-table { width:auto; min-width:200px; }
  .footer { margin-top:32px; padding-top:16px; border-top:1px solid #e2e8f0; display:flex; justify-content:space-between; font-size:11px; color:#999; }
  @media print { body { padding:16px; } @page { margin:1cm; } }
</style></head><body>
<div class="header">
  <div class="logo">
    <div class="logo-icon"><svg viewBox="0 0 24 24"><path d="M12 2C8 2 6 6 6 10c0 3 1 5 2 7s2 5 4 5 3-3 4-5 2-4 2-7c0-4-2-8-6-8z"/></svg></div>
    <span class="logo-name">${clínicaNome}</span>
  </div>
  <div class="header-right"><div class="title">Prontuário Odontológico</div><div>${dataImpressao}</div></div>
</div>

<div class="section">
  <div class="section-title">Dados do Paciente</div>
  <div class="info-grid">
    <div class="info-box"><div class="info-label">Nome completo</div><div class="info-value">${pacienteSelecionado.nome}</div></div>
    <div class="info-box"><div class="info-label">Telefone</div><div class="info-value">${pacienteSelecionado.telefone || "—"}</div></div>
    <div class="info-box"><div class="info-label">Idade</div><div class="info-value">${idade !== null ? idade + " anos" : "—"}</div></div>
    <div class="info-box"><div class="info-label">Data de nascimento</div><div class="info-value">${pacienteSelecionado.data_nascimento ? new Date(pacienteSelecionado.data_nascimento+"T12:00:00").toLocaleDateString("pt-BR") : "—"}</div></div>
    <div class="info-box"><div class="info-label">Convênio</div><div class="info-value">${pacienteSelecionado.convenio || "Particular"}</div></div>
    <div class="info-box"><div class="info-label">E-mail</div><div class="info-value">${pacienteSelecionado.email || "—"}</div></div>
  </div>
</div>

<div class="section">
  <div class="section-title">Odontograma</div>
  <div class="legenda">${legendaHTML}</div>
  <div class="odonto-container">
    <div class="arcada-label">▲ Arcada Superior</div>
    <div class="arcada">${allTeeth.slice(0,16).map(num => { const st = getStyle(num); const obs = dentes[num]?.observacoes || ""; return `<div class="tooth" style="background:${st.bg};border:2px solid ${st.border}"><span>${num}</span>${obs ? `<div class="tooth-obs" title="${obs}"></div>` : ""}</div>` }).join("")}</div>
    <div class="divider"></div>
    <div class="arcada">${allTeeth.slice(16).map(num => { const st = getStyle(num); const obs = dentes[num]?.observacoes || ""; return `<div class="tooth" style="background:${st.bg};border:2px solid ${st.border}"><span>${num}</span>${obs ? `<div class="tooth-obs" title="${obs}"></div>` : ""}</div>` }).join("")}</div>
    <div class="arcada-label">▼ Arcada Inferior</div>
  </div>
  ${resumoHTML ? `<div style="margin-top:16px"><table class="resumo-table"><thead><tr><th>Status</th><th>Qtd</th></tr></thead><tbody>${resumoHTML}</tbody></table></div>` : ""}
</div>

${consultasHTML ? `<div class="section"><div class="section-title">Histórico de Consultas</div><table><thead><tr><th>Data</th><th>Procedimento</th><th>Valor</th><th>Status</th></tr></thead><tbody>${consultasHTML}</tbody></table></div>` : ""}

<div class="footer"><span>Gerado pelo DentistOS em ${dataImpressao}</span><span>Documento confidencial — uso exclusivo do cirurgião-dentista</span></div>
</body></html>`

    const w = window.open("", "_blank", "width=900,height=700")
    if (w) {
      w.document.write(html)
      w.document.close()
      setTimeout(() => w.print(), 500)
    }
  }

  const filteredPacientes = pacientes.filter(p =>
    p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || p.telefone.includes(searchQuery)
  )

  return (
    <div className="flex flex-col" suppressHydrationWarning>
      <DashboardHeader title="Prontuários" />
      <div className="flex-1 p-4 lg:p-6">

        {/* Busca */}
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
              <div className="flex items-center gap-3">
                {pacienteSelecionado && (
                  <>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0A2540] font-semibold text-white text-sm">
                      {pacienteSelecionado.nome.split(" ").map((n:string)=>n[0]).join("").slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-medium">{pacienteSelecionado.nome}</div>
                      <div className="text-sm text-muted-foreground">{pacienteSelecionado.telefone}</div>
                    </div>
                    <Button variant="outline" size="sm" className="gap-2 ml-2" onClick={imprimirProntuario}>
                      <Printer className="h-4 w-4" /><span className="hidden sm:inline">Imprimir</span>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {!pacienteSelecionado ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/30" />
            <h3 className="mt-4 text-lg font-semibold">Selecione um paciente</h3>
            <p className="mt-2 text-sm text-muted-foreground">Busque o paciente acima para ver o prontuário e odontograma</p>
          </div>
        ) : loadingPaciente ? (
          <p className="py-12 text-center text-muted-foreground">Carregando prontuário...</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Odontograma */}
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
                <CardTitle className="text-lg">Odontograma</CardTitle>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS).map(([k,v]) => (
                    <div key={k} className="flex items-center gap-1">
                      <div className="h-3 w-3 rounded-sm" style={{ backgroundColor: v.bg, border: `1.5px solid ${v.border}` }} />
                      <span className="text-xs text-muted-foreground">{v.label}</span>
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent>
                <div className="mb-2 text-center text-sm font-medium text-muted-foreground">Arcada Superior</div>
                <div className="flex justify-center gap-1 flex-wrap">
                  {upperTeeth.map(num => {
                    const s = getStyle(num)
                    return (
                      <button key={num} onClick={() => abrirDialogDente(num)}
                        style={{ backgroundColor: s.bg, borderColor: denteSelecionado===num ? "#00C9A7" : s.border }}
                        className={`flex h-12 w-8 flex-col items-center justify-center rounded-md border-2 transition-all hover:scale-110 ${denteSelecionado===num ? "ring-2 ring-offset-1" : ""}`}>
                        <span className="text-xs font-semibold">{num}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="my-5 border-t-2 border-dashed border-muted" />
                <div className="flex justify-center gap-1 flex-wrap">
                  {lowerTeeth.map(num => {
                    const s = getStyle(num)
                    return (
                      <button key={num} onClick={() => abrirDialogDente(num)}
                        style={{ backgroundColor: s.bg, borderColor: denteSelecionado===num ? "#00C9A7" : s.border }}
                        className={`flex h-12 w-8 flex-col items-center justify-center rounded-md border-2 transition-all hover:scale-110 ${denteSelecionado===num ? "ring-2 ring-offset-1" : ""}`}>
                        <span className="text-xs font-semibold">{num}</span>
                      </button>
                    )
                  })}
                </div>
                <div className="mt-2 text-center text-sm font-medium text-muted-foreground">Arcada Inferior</div>
                <p className="mt-4 text-center text-xs text-muted-foreground">Toque em qualquer dente para alterar o status</p>
              </CardContent>
            </Card>

            {/* Info paciente */}
            <Card>
              <CardHeader><CardTitle className="text-lg">Informações</CardTitle></CardHeader>
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
                      <div className="text-sm text-muted-foreground">Última visita</div>
                      <div className="font-medium">{new Date(consultas[0].data_hora).toLocaleDateString("pt-BR")}</div>
                    </div>
                  </div>
                )}
                {pacienteSelecionado.convenio && (
                  <div className="flex items-center gap-3">
                    <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
                    <div><div className="text-sm text-muted-foreground">Convênio</div><div className="font-medium capitalize">{pacienteSelecionado.convenio}</div></div>
                  </div>
                )}
                <div className="rounded-lg border bg-muted/50 p-3">
                  <div className="text-xs font-medium text-muted-foreground mb-2">Resumo do odontograma</div>
                  {Object.entries(STATUS).filter(([k]) => k !== "saudavel").map(([k, v]) => {
                    const count = Object.values(dentes).filter(d => d.status === k).length
                    if (!count) return null
                    return <div key={k} className="flex justify-between text-sm py-0.5"><span className="text-muted-foreground">{v.label}</span><span className="font-semibold">{count}</span></div>
                  })}
                  {Object.values(dentes).filter(d => d.status !== "saudavel").length === 0 && (
                    <p className="text-xs text-muted-foreground">Todos os dentes saudáveis</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Histórico de Consultas */}
        {pacienteSelecionado && !loadingPaciente && (
          <Card className="mt-6">
            <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
              <CardTitle className="text-lg">Histórico de Consultas</CardTitle>
              <Button size="sm" className="gap-2 bg-[#00C9A7] text-[#0A2540]" onClick={() => setIsAddProcOpen(true)}>
                <Plus className="h-4 w-4" /> Adicionar procedimento
              </Button>
            </CardHeader>
            <CardContent>
              {consultas.length === 0 ? (
                <div className="py-8 text-center">
                  <Calendar className="mx-auto h-10 w-10 text-muted-foreground/30" />
                  <p className="mt-3 text-muted-foreground">Nenhuma consulta registrada</p>
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
                            {new Date(c.data_hora).toLocaleDateString("pt-BR")} às {new Date(c.data_hora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                          </div>
                          {c.observacoes && <div className="mt-1 text-sm text-muted-foreground">{c.observacoes}</div>}
                        </div>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        {c.valor && <div className="font-semibold text-[#00C9A7]">R$ {Number(c.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>}
                        <Badge variant="outline" className={`mt-1 ${c.status === "concluída" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : c.status === "faltou" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}`}>
                          {c.status === "concluída" ? "Concluída" : c.status === "faltou" ? "Faltou" : c.status === "confirmada" ? "Confirmada" : "Agendada"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Dialog: alterar dente */}
        <Dialog open={isToothDialogOpen} onOpenChange={setIsToothDialogOpen}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Dente {denteSelecionado}</DialogTitle>
              <DialogDescription>Altere o status e adicione observações</DialogDescription>
            </DialogHeader>
            {/* Preview da cor selecionada */}
            {novoStatus && (
              <div className="flex items-center gap-3 rounded-lg border p-3"
                style={{ backgroundColor: STATUS[novoStatus]?.bg, borderColor: STATUS[novoStatus]?.border }}>
                <div className="h-8 w-8 rounded-md border-2 flex items-center justify-center text-xs font-bold"
                  style={{ borderColor: STATUS[novoStatus]?.border, backgroundColor: STATUS[novoStatus]?.bg }}>
                  {denteSelecionado}
                </div>
                <span className="font-medium">{STATUS[novoStatus]?.label}</span>
              </div>
            )}
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label>Status</Label>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(STATUS).map(([k, v]) => (
                    <button key={k} onClick={() => setNovoStatus(k)}
                      style={{ backgroundColor: v.bg, borderColor: novoStatus === k ? v.border : "#e2e8f0", borderWidth: novoStatus === k ? "2px" : "1px" }}
                      className="rounded-lg p-2 text-xs font-medium transition-all hover:scale-105">
                      {v.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Observações</Label>
                <Input placeholder="Ex: Restauração em resina..." value={obsObservacao} onChange={e => setObsObservacao(e.target.value)} />
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

        {/* Dialog: adicionar procedimento */}
        <Dialog open={isAddProcOpen} onOpenChange={setIsAddProcOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar procedimento</DialogTitle>
              <DialogDescription>Registre um procedimento para {pacienteSelecionado?.nome}</DialogDescription>
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
