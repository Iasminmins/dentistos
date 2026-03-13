"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, TrendingUp, TrendingDown, CreditCard, Banknote, Clock, Plus, Download, ArrowUpRight, ArrowDownRight, Target, Search } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Lancamento = {
  id: string; tipo: string; categoria: string; descricao: string
  valor: number; forma_pagamento: string; status: string
  data_vencimento: string; data_pagamento?: string; created_at: string
  pacientes?: { nome: string }
}

const emptyForm = { tipo: "receita", categoria: "", descricao: "", valor: "", forma_pagamento: "pix", status: "pago", data_vencimento: new Date().toISOString().split("T")[0], paciente_id: "" }

export default function FinanceiroPage() {
  const supabase = createClient()
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([])
  const [loading, setLoading] = useState(true)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [tabAtiva, setTabAtiva] = useState("todos")
  const [searchQuery, setSearchQuery] = useState("")
  const [pacientes, setPacientes] = useState<{ id: string; nome: string }[]>([])
  const [metaMensal, setMetaMensal] = useState(0)

  useEffect(() => { initialize() }, [])

  async function initialize() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()
    if (!profile) return
    setTenantId(profile.tenant_id)
    const { data: config } = await supabase.from("configurações_clínica").select("meta_mensal").eq("tenant_id", profile.tenant_id).single()
    if (config?.meta_mensal) setMetaMensal(Number(config.meta_mensal))
    const { data: pacs } = await supabase.from("pacientes").select("id, nome").eq("tenant_id", profile.tenant_id).order("nome")
    if (pacs) setPacientes(pacs)
    await loadLancamentos(profile.tenant_id)
  }

  async function loadLancamentos(tid?: string) {
    const id = tid || tenantId
    if (!id) return
    setLoading(true)
    const mes = new Date(); const inicio = new Date(mes.getFullYear(), mes.getMonth(), 1).toISOString().split("T")[0]
    const fim = new Date(mes.getFullYear(), mes.getMonth() + 1, 0).toISOString().split("T")[0]
    const { data } = await supabase.from("lancamentos_financeiros")
      .select("*, pacientes(nome)").eq("tenant_id", id)
      .gte("data_vencimento", inicio).lte("data_vencimento", fim)
      .order("created_at", { ascending: false })
    if (data) setLancamentos(data)
    setLoading(false)
  }

  async function handleSave() {
    if (!form.descricao || !form.valor || !tenantId) return
    setSaving(true)
    await supabase.from("lancamentos_financeiros").insert({
      tenant_id: tenantId, tipo: form.tipo, categoria: form.categoria || form.tipo,
      descricao: form.descricao, valor: parseFloat(form.valor),
      forma_pagamento: form.forma_pagamento, status: form.status,
      data_vencimento: form.data_vencimento,
      data_pagamento: form.status === "pago" ? form.data_vencimento : null,
      paciente_id: form.paciente_id || null
    })
    await loadLancamentos()
    setIsOpen(false); setForm(emptyForm); setSaving(false)
  }

  async function toggleStatus(id: string, status: string) {
    const novoStatus = status === "pago" ? "pendente" : "pago"
    await supabase.from("lancamentos_financeiros").update({
      status: novoStatus, data_pagamento: novoStatus === "pago" ? new Date().toISOString().split("T")[0] : null
    }).eq("id", id)
    await loadLancamentos()
  }


  const receitas = lancamentos.filter(l => l.tipo === "receita")
  const receitaMes = receitas.filter(l => l.status === "pago").reduce((s, l) => s + Number(l.valor), 0)
  const aReceber = receitas.filter(l => l.status !== "pago").reduce((s, l) => s + Number(l.valor), 0)
  const caixaHoje = lancamentos.filter(l => l.status === "pago" && l.data_pagamento === new Date().toISOString().split("T")[0]).reduce((s, l) => s + Number(l.valor), 0)
  const percentMeta = metaMensal > 0 ? Math.min(Math.round((receitaMes / metaMensal) * 100), 100) : 0

  const filtered = lancamentos.filter(l => {
    const matchSearch = l.descricao.toLowerCase().includes(searchQuery.toLowerCase()) || (l.pacientes?.nome || "").toLowerCase().includes(searchQuery.toLowerCase())
    if (tabAtiva === "pagos") return matchSearch && l.status === "pago"
    if (tabAtiva === "pendentes") return matchSearch && l.status !== "pago"
    return matchSearch
  })

  const statsCards = [
    { label: "Receita do mes", value: `R$ ${receitaMes.toLocaleString("pt-BR", {minimumFractionDigits: 2})}`, change: `${receitas.length} lancamentos`, trend: "up", icon: TrendingUp, color: "bg-emerald-500" },
    { label: "Caixa hoje", value: `R$ ${caixaHoje.toLocaleString("pt-BR", {minimumFractionDigits: 2})}`, change: "recebido hoje", trend: "neutral", icon: DollarSign, color: "bg-blue-500" },
    { label: "A receber", value: `R$ ${aReceber.toLocaleString("pt-BR", {minimumFractionDigits: 2})}`, change: `${lancamentos.filter(l=>l.status!=="pago").length} pendentes`, trend: "neutral", icon: Clock, color: "bg-amber-500" },
    { label: "Meta mensal", value: metaMensal > 0 ? `${percentMeta}%` : "Sem meta", change: metaMensal > 0 ? `R$ ${metaMensal.toLocaleString("pt-BR")}` : "Configure em Configurações", trend: percentMeta >= 100 ? "up" : "neutral", icon: Target, color: "bg-purple-500" },
  ]

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Financeiro" />
      <div className="flex-1 p-4 lg:p-6">

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <p className="mt-2 text-2xl font-bold">{loading ? "..." : stat.value}</p>
                    <div className="mt-1 flex items-center gap-1 text-sm">
                      {stat.trend === "up" && <ArrowUpRight className="h-4 w-4 text-emerald-500" />}
                      <span className={stat.trend === "up" ? "text-emerald-600" : "text-muted-foreground"}>{stat.change}</span>
                    </div>
                  </div>
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Meta mensal */}
        {metaMensal > 0 && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Meta mensal</h3>
                  <p className="text-sm text-muted-foreground">R$ {receitaMes.toLocaleString("pt-BR",{minimumFractionDigits:2})} de R$ {metaMensal.toLocaleString("pt-BR")}</p>
                </div>
                <span className="text-2xl font-bold text-[#00C9A7]">{percentMeta}%</span>
              </div>
              <Progress value={percentMeta} className="mt-4 h-3" />
              {percentMeta < 100 && <p className="mt-2 text-sm text-muted-foreground">Faltam R$ {(metaMensal - receitaMes).toLocaleString("pt-BR",{minimumFractionDigits:2})} para atingir a meta</p>}
            </CardContent>
          </Card>
        )}


        {/* Lancamentos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-lg">Lançamentos do mês</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Buscar..." className="pl-9 w-48" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
              <Button size="sm" className="bg-[#00C9A7] text-[#0A2540]" onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Novo
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={tabAtiva} onValueChange={setTabAtiva}>
              <TabsList className="mb-4">
                <TabsTrigger value="todos">Todos ({lancamentos.length})</TabsTrigger>
                <TabsTrigger value="pagos">Pagos ({lancamentos.filter(l=>l.status==="pago").length})</TabsTrigger>
                <TabsTrigger value="pendentes">Pendentes ({lancamentos.filter(l=>l.status!=="pago").length})</TabsTrigger>              </TabsList>
              <TabsContent value={tabAtiva}>
                {loading ? (
                  <p className="py-8 text-center text-muted-foreground">Carregando...</p>
                ) : filtered.length === 0 ? (
                  <div className="py-8 text-center">
                    <DollarSign className="mx-auto h-12 w-12 text-muted-foreground/30" />
                    <p className="mt-4 text-muted-foreground">Nenhum lancamento encontrado</p>
                    <Button onClick={() => setIsOpen(true)} className="mt-4 bg-[#00C9A7] text-[#0A2540]">Adicionar lancamento</Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Descricao</TableHead>
                        <TableHead className="hidden md:table-cell">Paciente</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead className="hidden lg:table-cell">Pagamento</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.map(tx => (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="font-medium">{tx.descricao}</div>
                            <div className="text-xs text-muted-foreground">{new Date(tx.data_vencimento + "T12:00:00").toLocaleDateString("pt-BR")}</div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-muted-foreground">{tx.pacientes?.nome || "-"}</TableCell>
                          <TableCell className="font-semibold">R$ {Number(tx.valor).toLocaleString("pt-BR",{minimumFractionDigits:2})}</TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex items-center gap-2">
                              {tx.forma_pagamento === "pix" && <Banknote className="h-4 w-4" />}
                              {tx.forma_pagamento?.includes("cartao") && <CreditCard className="h-4 w-4" />}
                              {tx.forma_pagamento === "dinheiro" && <DollarSign className="h-4 w-4" />}
                              <span className="capitalize">{tx.forma_pagamento}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <button onClick={() => toggleStatus(tx.id, tx.status)}>
                              <Badge variant="outline" className={tx.status === "pago" ? "border-emerald-200 bg-emerald-50 text-emerald-700 cursor-pointer hover:bg-emerald-100" : "border-amber-200 bg-amber-50 text-amber-700 cursor-pointer hover:bg-amber-100"}>
                                {tx.status === "pago" ? "Pago" : "Pendente"}
                              </Badge>
                            </button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>


        {/* Dialog Novo Lancamento */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader><DialogTitle>Novo lançamento</DialogTitle><DialogDescription>Registre uma receita ou despesa da clínica</DialogDescription></DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm({...form, tipo: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="receita">Receita</SelectItem>
                    <SelectItem value="despesa">Despesa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Descricao *</Label>
                <Input placeholder="Ex: Consulta, Material, Aluguel..." value={form.descricao} onChange={e => setForm({...form, descricao: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Paciente (opcional)</Label>
                <Select value={form.paciente_id} onValueChange={v => setForm({...form, paciente_id: v})}>
                  <SelectTrigger><SelectValue placeholder="Selecionar paciente" /></SelectTrigger>
                  <SelectContent>
                    {pacientes.map(p => <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Valor (R$) *</Label>
                  <Input type="number" placeholder="0.00" value={form.valor} onChange={e => setForm({...form, valor: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Data</Label>
                  <Input type="date" value={form.data_vencimento} onChange={e => setForm({...form, data_vencimento: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>Forma de pagamento</Label>
                  <Select value={form.forma_pagamento} onValueChange={v => setForm({...form, forma_pagamento: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pix">Pix</SelectItem>
                      <SelectItem value="dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="cartao_debito">Cartao Debito</SelectItem>
                      <SelectItem value="cartao_credito">Cartao Credito</SelectItem>
                      <SelectItem value="convenio">Convenio</SelectItem>
                      <SelectItem value="boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({...form, status: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Cancelar</Button>
              <Button disabled={saving || !form.descricao || !form.valor} className="bg-[#00C9A7] text-[#0A2540]" onClick={handleSave}>
                {saving ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
