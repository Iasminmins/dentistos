"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import { MessageCircle, CheckCircle2, Clock, XCircle, Settings, Send, QrCode, Smartphone, Edit2, Trash2, ExternalLink, Zap, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type MsgWpp = { id: string; tipo: string; conteudo: string; status: string; created_at: string; pacientes?: { nome: string; telefone: string } }
type Config = { whatsapp_token?: string; whatsapp_número?: string; whatsapp_confirmacao_48h?: boolean; whatsapp_lembrete_2h?: boolean; whatsapp_reativação?: boolean; whatsapp_aniversario?: boolean; whatsapp_template_confirmacao?: string; whatsapp_template_lembrete?: string; whatsapp_template_reativação?: string }

const defaultTemplates = {
  confirmacao: "Ola {{nome}}, sua consulta esta marcada para {{data}} as {{hora}}. Confirme respondendo SIM ou NAO.",
  lembrete: "Ola {{nome}}, lembrando que sua consulta e hoje as {{hora}}. Estamos te esperando!",
  reativação: "Ola {{nome}}, faz tempo que não te vemos! Que tal agendar uma consulta de rotina?"
}

export default function WhatsAppPage() {
  const supabase = createClient()
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [config, setConfig] = useState<Config>({})
  const [mensagens, setMensagens] = useState<MsgWpp[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [token, setToken] = useState("")
  const [número, setNúmero] = useState("")
  const [templateConfirmacao, setTemplateConfirmacao] = useState(defaultTemplates.confirmacao)
  const [templateLembrete, setTemplateLembrete] = useState(defaultTemplates.lembrete)
  const [templateReativação, setTemplateReativação] = useState(defaultTemplates.reativação)
  const [autoConfirmacao, setAutoConfirmacao] = useState(false)
  const [autoLembrete, setAutoLembrete] = useState(false)
  const [autoReativação, setAutoReativação] = useState(false)
  const [autoAniversario, setAutoAniversario] = useState(false)
  const [isConfigOpen, setIsConfigOpen] = useState(false)
  const [isNovoTemplateOpen, setIsNovoTemplateOpen] = useState(false)
  const [novoTemplateLabel, setNovoTemplateLabel] = useState("")
  const [novoTemplateTexto, setNovoTemplateTexto] = useState("")
  const [customTemplates, setCustomTemplates] = useState<{label: string; texto: string}[]>([])

  const isConectado = !!(config.whatsapp_token && config.whatsapp_número)

  useEffect(() => { initialize() }, [])

  async function initialize() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()
    if (!profile) return
    setTenantId(profile.tenant_id)
    const { data: cfg } = await supabase.from("configurações_clínica").select("*").eq("tenant_id", profile.tenant_id).single()
    if (cfg) {
      setConfig(cfg)
      setToken(cfg.whatsapp_token || "")
      setNúmero(cfg.whatsapp_número || "")
      setTemplateConfirmacao(cfg.whatsapp_template_confirmacao || defaultTemplates.confirmacao)
      setTemplateLembrete(cfg.whatsapp_template_lembrete || defaultTemplates.lembrete)
      setTemplateReativação(cfg.whatsapp_template_reativação || defaultTemplates.reativação)
      setAutoConfirmacao(cfg.whatsapp_confirmacao_48h ?? false)
      setAutoLembrete(cfg.whatsapp_lembrete_2h ?? false)
      setAutoReativação(cfg.whatsapp_reativação ?? false)
      setAutoAniversario(cfg.whatsapp_aniversario ?? false)
    }
    const { data: msgs } = await supabase.from("mensagens_whatsapp")
      .select("*, pacientes(nome, telefone)")
      .eq("tenant_id", profile.tenant_id)
      .order("created_at", { ascending: false })
      .limit(50)
    if (msgs) setMensagens(msgs)
    setLoading(false)
  }

  async function saveConfig() {
    if (!tenantId) return
    setSaving(true)
    await supabase.from("configurações_clínica").update({
      whatsapp_token: token, whatsapp_número: número,
      whatsapp_confirmacao_48h: autoConfirmacao, whatsapp_lembrete_2h: autoLembrete,
      whatsapp_reativação: autoReativação, whatsapp_aniversario: autoAniversario,
      whatsapp_template_confirmacao: templateConfirmacao,
      whatsapp_template_lembrete: templateLembrete,
      whatsapp_template_reativação: templateReativação,
    }).eq("tenant_id", tenantId)
    setSaving(false); setSaved(true)
    setIsConfigOpen(false)
    setTimeout(() => setSaved(false), 2000)
    await initialize()
  }

  const enviadas = mensagens.filter(m => m.status === "enviado").length
  const entregues = mensagens.filter(m => m.status === "entregue").length
  const pendentes = mensagens.filter(m => m.status === "pendente").length
  const falhas = mensagens.filter(m => m.status === "falha").length


  return (
    <div className="flex flex-col">
      <DashboardHeader title="WhatsApp" />
      <div className="flex-1 p-4 lg:p-6">

        {/* Status da conexao */}
        <Card className={`mb-6 border-2 ${isConectado ? "border-emerald-200 bg-emerald-50/30" : "border-amber-200 bg-amber-50/30"}`}>
          <CardContent className="flex flex-col items-center justify-between gap-4 p-6 sm:flex-row">
            <div className="flex items-center gap-4">
              <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${isConectado ? "bg-emerald-100" : "bg-amber-100"}`}>
                {isConectado ? <Smartphone className="h-7 w-7 text-emerald-600" /> : <QrCode className="h-7 w-7 text-amber-600" />}
              </div>
              <div>
                <h3 className="font-semibold">{isConectado ? "WhatsApp configurado" : "WhatsApp não configurado"}</h3>
                <p className="text-sm text-muted-foreground">
                  {isConectado ? `Número: ${config.whatsapp_número}` : "Configure o token da API Z-API ou Evolution API para ativar o envio automático"}
                </p>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {isConectado && <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200"><CheckCircle2 className="mr-1 h-3 w-3" />Ativo</Badge>}
              <Button variant={isConectado ? "outline" : "default"} className={!isConectado ? "bg-[#00C9A7] text-[#0A2540]" : ""} onClick={() => setIsConfigOpen(true)}>
                <Settings className="mr-2 h-4 w-4" />{isConectado ? "Editar configuracao" : "Configurar agora"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Aviso se não configurado */}
        {!isConectado && (
          <Card className="mb-6 border-blue-200 bg-blue-50/40">
            <CardContent className="flex items-start gap-4 p-5">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="font-semibold text-blue-800">Como ativar o WhatsApp automático</h4>
                <p className="mt-1 text-sm text-blue-700">O DentistOS usa a <strong>Z-API</strong> (servico brasileiro, plano gratuito disponivel) para enviar mensagens automaticas. Clique no botao abaixo para criar sua conta e obter o token de acesso.</p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <Button size="sm" variant="outline" className="border-blue-300 text-blue-700" onClick={() => window.open("https://app.z-api.io", "_blank")}>
                    <ExternalLink className="mr-2 h-4 w-4" />Criar conta Z-API gratis
                  </Button>
                  <Button size="sm" className="bg-[#00C9A7] text-[#0A2540]" onClick={() => setIsConfigOpen(true)}>
                    <Zap className="mr-2 h-4 w-4" />Inserir token
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-4">
          {[
            { label: "Enviadas", value: enviadas, icon: Send, color: "bg-blue-500" },
            { label: "Entregues", value: entregues, icon: CheckCircle2, color: "bg-emerald-500" },
            { label: "Pendentes", value: pendentes, icon: Clock, color: "bg-amber-500" },
            { label: "Falhas", value: falhas, icon: XCircle, color: "bg-red-500" },
          ].map(stat => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{loading ? "..." : stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>


        {/* Tabs */}
        <Tabs defaultValue="histórico">
          <TabsList className="mb-6">
            <TabsTrigger value="histórico"><MessageCircle className="mr-2 h-4 w-4" />Histórico</TabsTrigger>
            <TabsTrigger value="templates"><Edit2 className="mr-2 h-4 w-4" />Templates</TabsTrigger>
            <TabsTrigger value="automacoes"><Settings className="mr-2 h-4 w-4" />Automacoes</TabsTrigger>
          </TabsList>

          {/* Histórico */}
          <TabsContent value="histórico">
            <Card>
              <CardHeader><CardTitle className="text-lg">Mensagens enviadas</CardTitle></CardHeader>
              <CardContent>
                {loading ? <p className="py-8 text-center text-muted-foreground">Carregando...</p> :
                mensagens.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
                    <p className="mt-4 text-muted-foreground">{isConectado ? "Nenhuma mensagem enviada ainda" : "Configure o WhatsApp para comecar a enviar mensagens automaticas"}</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mensagens.map(msg => (
                      <div key={msg.id} className="flex items-start gap-4 rounded-lg border p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#25D366] text-white">
                          <MessageCircle className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h4 className="font-medium">{(msg.pacientes as any)?.nome || "Paciente"}</h4>
                              <p className="text-sm text-muted-foreground">{(msg.pacientes as any)?.telefone}</p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <span className="text-xs text-muted-foreground">{new Date(msg.created_at).toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", hour:"2-digit", minute:"2-digit" })}</span>
                              <Badge variant="outline" className={msg.status === "entregue" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : msg.status === "falha" ? "border-red-200 bg-red-50 text-red-700" : "border-amber-200 bg-amber-50 text-amber-700"}>
                                {msg.status === "entregue" ? "Entregue" : msg.status === "falha" ? "Falha" : "Enviado"}
                              </Badge>
                            </div>
                          </div>
                          <div className="mt-2 rounded-lg bg-muted p-3">
                            <p className="text-sm">{msg.conteudo}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Templates */}
          <TabsContent value="templates">
            <Card>
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-lg">Templates de mensagem</CardTitle>
                  <CardDescription>Personalize as mensagens enviadas automaticamente. Use {'{{nome}}'}, {'{{data}}'}, {'{{hora}}'} como variaveis.</CardDescription>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 gap-2" onClick={() => { setNovoTemplateLabel(""); setNovoTemplateTexto(""); setIsNovoTemplateOpen(true) }}>
                  <Plus className="h-4 w-4" /> Novo template
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: "Confirmacao de consulta (48h antes)", value: templateConfirmacao, setter: setTemplateConfirmacao },
                  { label: "Lembrete do dia (2h antes)", value: templateLembrete, setter: setTemplateLembrete },
                  { label: "Reativação de paciente inativo", value: templateReativação, setter: setTemplateReativação },
                ].map(t => (
                  <div key={t.label} className="grid gap-2">
                    <Label>{t.label}</Label>
                    <textarea className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                      value={t.value} onChange={e => t.setter(e.target.value)} />
                  </div>
                ))}
                <div className="flex flex-wrap gap-2 pt-2">
                  <p className="text-sm text-muted-foreground w-full">Variaveis disponíveis:</p>
                  {["{{nome}}", "{{data}}", "{{hora}}", "{{procedimento}}"].map(v => (
                    <Badge key={v} variant="outline" className="font-mono text-xs">{v}</Badge>
                  ))}
                </div>
                {customTemplates.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="mb-3 text-sm font-medium text-muted-foreground">Templates personalizados</p>
                    {customTemplates.map((t, i) => (
                      <div key={i} className="mb-4 grid gap-2">
                        <div className="flex items-center justify-between">
                          <Label>{t.label}</Label>
                          <button onClick={() => setCustomTemplates(prev => prev.filter((_,j) => j !== i))} className="text-xs text-red-500 hover:underline">Remover</button>
                        </div>
                        <textarea className="min-h-[80px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                          value={t.texto} onChange={e => setCustomTemplates(prev => prev.map((x,j) => j===i ? {...x, texto: e.target.value} : x))} />
                      </div>
                    ))}
                  </div>
                )}
                <Button className="bg-[#00C9A7] text-[#0A2540]" disabled={saving} onClick={saveConfig}>
                  {saved ? <><CheckCircle2 className="mr-2 h-4 w-4" />Salvo!</> : saving ? "Salvando..." : "Salvar templates"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automacoes */}
          <TabsContent value="automacoes">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader><CardTitle className="text-lg">Envios automáticos</CardTitle></CardHeader>
                <CardContent className="space-y-6">
                  {[
                    { label: "Confirmacao 48h antes", desc: "Pede confirmacao da consulta 2 dias antes", val: autoConfirmacao, set: setAutoConfirmacao },
                    { label: "Lembrete 2h antes", desc: "Lembrete no dia da consulta", val: autoLembrete, set: setAutoLembrete },
                    { label: "Reativação de inativos", desc: "Mensagem para pacientes sem consulta ha 6 meses", val: autoReativação, set: setAutoReativação },
                    { label: "Aniversariantes", desc: "Felicitacoes no dia do aniversario", val: autoAniversario, set: setAutoAniversario },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div><Label>{item.label}</Label><p className="text-sm text-muted-foreground">{item.desc}</p></div>
                      <Switch checked={item.val} onCheckedChange={v => { item.set(v) }} disabled={!isConectado} />
                    </div>
                  ))}
                  {!isConectado && <p className="text-xs text-amber-600">⚠ Configure o WhatsApp para ativar as automacoes</p>}
                  <Button className="bg-[#00C9A7] text-[#0A2540]" disabled={saving || !isConectado} onClick={saveConfig}>
                    {saved ? <><CheckCircle2 className="mr-2 h-4 w-4" />Salvo!</> : saving ? "Salvando..." : "Salvar automacoes"}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>


        {/* Dialog configurar token */}
        <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Configurar WhatsApp</DialogTitle>
              <DialogDescription>Conecte sua conta Z-API para envio automático de mensagens</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="rounded-lg border bg-blue-50 p-4 text-sm text-blue-800 space-y-2">
                <p className="font-semibold">Como obter o token Z-API:</p>
                <ol className="list-decimal list-inside space-y-1 text-blue-700">
                  <li>Acesse <strong>app.z-api.io</strong> e crie uma conta gratis</li>
                  <li>Crie uma nova instancia e conecte seu WhatsApp pelo QR Code</li>
                  <li>Copie o <strong>Token</strong> e o <strong>ID da instancia</strong></li>
                  <li>Cole abaixo e salve</li>
                </ol>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 mt-2" onClick={() => window.open("https://app.z-api.io", "_blank")}>
                  <ExternalLink className="mr-2 h-4 w-4" />Abrir Z-API
                </Button>
              </div>
              <div className="grid gap-2">
                <Label>Número do WhatsApp (com DDD)</Label>
                <Input placeholder="Ex: 5511999990000" value={número} onChange={e => setNúmero(e.target.value)} />
                <p className="text-xs text-muted-foreground">Apenas números, sem espacos ou caracteres especiais</p>
              </div>
              <div className="grid gap-2">
                <Label>Token da API (Z-API ou Evolution API)</Label>
                <Input type="password" placeholder="Cole o token aqui..." value={token} onChange={e => setToken(e.target.value)} />
                <p className="text-xs text-muted-foreground">Mantido em seguranca, nunca exibido publicamente</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsConfigOpen(false)}>Cancelar</Button>
              <Button disabled={saving || !token || !número} className="bg-[#00C9A7] text-[#0A2540]" onClick={saveConfig}>
                {saving ? "Salvando..." : "Salvar e ativar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog: Novo Template */}
        <Dialog open={isNovoTemplateOpen} onOpenChange={setIsNovoTemplateOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar novo template</DialogTitle>
              <DialogDescription>Crie um template personalizado para envios manuais ou automações futuras</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome do template *</Label>
                <Input placeholder="Ex: Pós-consulta, Promoção..." value={novoTemplateLabel} onChange={e => setNovoTemplateLabel(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Mensagem *</Label>
                <textarea className="min-h-[100px] w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                  placeholder="Ola {{nome}}, sua consulta foi concluída com sucesso..."
                  value={novoTemplateTexto} onChange={e => setNovoTemplateTexto(e.target.value)} />
              </div>
              <div className="flex flex-wrap gap-2">
                <p className="text-xs text-muted-foreground w-full">Variáveis:</p>
                {["{{nome}}", "{{data}}", "{{hora}}", "{{procedimento}}"].map(v => (
                  <Badge key={v} variant="outline" className="cursor-pointer font-mono text-xs hover:bg-muted"
                    onClick={() => setNovoTemplateTexto(t => t + v)}>{v}</Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsNovoTemplateOpen(false)}>Cancelar</Button>
              <Button disabled={!novoTemplateLabel || !novoTemplateTexto} className="bg-[#00C9A7] text-[#0A2540]"
                onClick={() => { setCustomTemplates(prev => [...prev, { label: novoTemplateLabel, texto: novoTemplateTexto }]); setIsNovoTemplateOpen(false) }}>
                Criar template
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
