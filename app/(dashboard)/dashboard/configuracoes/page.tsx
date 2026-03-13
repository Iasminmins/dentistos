"use client"

import { useState, useEffect, useRef } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, User, CreditCard, Save, CheckCircle2, Camera, ExternalLink, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Máscara de telefone: (11) 99999-9999
function maskPhone(v: string) {
  const d = v.replace(/\D/g, "").slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ""
  if (d.length <= 7) return `(${d.slice(0,2)}) ${d.slice(2)}`
  return `(${d.slice(0,2)}) ${d.slice(2,7)}-${d.slice(7)}`
}

// Gera slug a partir do nome
function toSlug(nome: string) {
  return nome.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [clinica, setClinica] = useState({ nome_clinica: "", slug: "", endereco: "", cidade: "", estado: "", cep: "", meta_mensal: "" })
  const [perfil, setPerfil] = useState({ nome: "", email: "", telefone: "", cro: "", especialidade: "clinico" })
  const [senha, setSenha] = useState({ nova: "", confirmar: "" })
  const [msgSenha, setMsgSenha] = useState("")
  const [cepLoading, setCepLoading] = useState(false)

  useEffect(() => { initialize() }, [])

  async function initialize() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data: profile } = await supabase.from("profiles").select("*, tenants(*)").eq("id", user.id).single()
    if (!profile) return
    setTenantId(profile.tenant_id)
    setPerfil({
      nome: profile.nome || "",
      email: profile.email || user.email || "",
      telefone: profile.telefone || "",
      cro: profile.cro || "",
      especialidade: profile.especialidade || "clinico"
    })
    if (profile.avatar_url) setAvatarUrl(profile.avatar_url)
    const t = (profile as any).tenants
    if (t) {
      // Calcula dias restantes do trial
      if (t.created_at) {
        const created = new Date(t.created_at)
        const diff = Math.ceil(14 - (Date.now() - created.getTime()) / (1000*60*60*24))
        setTrialDaysLeft(Math.max(0, diff))
      }
      setClinica(prev => ({ ...prev, nome_clinica: t.nome_clinica || "", slug: t.slug || "" }))
    }
    const { data: config } = await supabase.from("configuracoes_clinica").select("*").eq("tenant_id", profile.tenant_id).single()
    if (config) {
      setClinica(prev => ({
        ...prev,
        endereco: config.endereco || "",
        cidade: config.cidade || "",
        estado: config.estado || "",
        cep: config.cep || "",
        meta_mensal: config.meta_mensal?.toString() || ""
      }))
    }
    setLoading(false)
  }

  // Busca CEP via ViaCEP e preenche cidade/estado automaticamente
  async function buscarCep(cep: string) {
    const digits = cep.replace(/\D/g, "")
    if (digits.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${digits}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setClinica(prev => ({
          ...prev,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
          endereco: prev.endereco || (data.logradouro ? `${data.logradouro}, ${data.bairro}` : prev.endereco)
        }))
      }
    } catch {}
    setCepLoading(false)
  }

  function showSaved(key: string) { setSaved(key); setTimeout(() => setSaved(null), 2500) }

  // FIX #1: Validação obrigatória antes de salvar
  async function saveClinica() {
    const newErrors: Record<string, string> = {}
    if (!clinica.nome_clinica.trim()) newErrors.nome_clinica = "Nome da clínica é obrigatório"
    if (!clinica.slug.trim()) newErrors.slug = "O slug é obrigatório"
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setErrors({})
    if (!tenantId) return
    setSaving("clinica")
    await supabase.from("tenants").update({ nome_clinica: clinica.nome_clinica, slug: clinica.slug }).eq("id", tenantId)
    await supabase.from("configuracoes_clinica").update({
      endereco: clinica.endereco, cidade: clinica.cidade,
      estado: clinica.estado, cep: clinica.cep,
      meta_mensal: clinica.meta_mensal ? parseFloat(clinica.meta_mensal) : null
    }).eq("tenant_id", tenantId)
    setSaving(null); showSaved("clinica")
  }

  async function savePerfil() {
    const newErrors: Record<string, string> = {}
    if (!perfil.nome.trim()) newErrors.nome = "Nome é obrigatório"
    if (Object.keys(newErrors).length > 0) { setErrors(newErrors); return }
    setErrors({})
    if (!userId) return
    setSaving("perfil")
    await supabase.from("profiles").update({
      nome: perfil.nome,
      telefone: perfil.telefone.replace(/\D/g, ""), // salva só dígitos
      cro: perfil.cro,
      especialidade: perfil.especialidade
    }).eq("id", userId)
    setSaving(null); showSaved("perfil")
  }

  async function saveSenha() {
    if (senha.nova !== senha.confirmar) { setMsgSenha("As senhas não coincidem"); return }
    if (senha.nova.length < 6) { setMsgSenha("Mínimo 6 caracteres"); return }
    setSaving("senha")
    const { error } = await supabase.auth.updateUser({ password: senha.nova })
    setSaving(null)
    if (error) { setMsgSenha(error.message) } else { setMsgSenha(""); setSenha({ nova: "", confirmar: "" }); showSaved("senha") }
  }

  // FIX #7: Upload de avatar
  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !userId) return
    const ext = file.name.split(".").pop()
    const path = `avatars/${userId}.${ext}`
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true })
    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
      await supabase.from("profiles").update({ avatar_url: data.publicUrl }).eq("id", userId)
    }
  }

  const SaveButton = ({ id }: { id: string }) => (
    <Button disabled={saving === id} className="bg-[#00C9A7] text-[#0A2540] hover:bg-[#00C9A7]/90"
      onClick={id === "clinica" ? saveClinica : id === "perfil" ? savePerfil : saveSenha}>
      {saved === id ? <><CheckCircle2 className="mr-2 h-4 w-4" />Salvo!</> : saving === id ? "Salvando..." : <><Save className="mr-2 h-4 w-4" />Salvar</>}
    </Button>
  )

  const initials = perfil.nome.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?"

  if (loading) return (
    <div className="flex flex-col">
      <DashboardHeader title="Configurações" />
      <div className="p-8 text-center text-muted-foreground">Carregando...</div>
    </div>
  )

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Configurações" />
      <div className="flex-1 p-4 lg:p-6">
        <Tabs defaultValue="clinica" className="space-y-6">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="clinica"><Building2 className="mr-2 h-4 w-4" />Clínica</TabsTrigger>
            <TabsTrigger value="perfil"><User className="mr-2 h-4 w-4" />Perfil</TabsTrigger>
            <TabsTrigger value="plano"><CreditCard className="mr-2 h-4 w-4" />Plano</TabsTrigger>
          </TabsList>

          {/* ===== ABA CLÍNICA ===== */}
          <TabsContent value="clinica">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Clínica</CardTitle>
                <CardDescription>Informações que aparecem para seus pacientes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  {/* FIX #1 e #8: Validação + acentuação */}
                  <div className="space-y-2">
                    <Label>Nome da clínica *</Label>
                    <Input
                      value={clinica.nome_clinica}
                      onChange={e => {
                        const nome = e.target.value
                        // FIX #2: slug auto-sincroniza com o nome
                        setClinica({ ...clinica, nome_clinica: nome, slug: toSlug(nome) })
                        if (errors.nome_clinica) setErrors(prev => ({ ...prev, nome_clinica: "" }))
                      }}
                      className={errors.nome_clinica ? "border-red-500" : ""}
                    />
                    {errors.nome_clinica && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.nome_clinica}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (link de agendamento)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">dentistos.com.br/agendar/</span>
                      <Input value={clinica.slug} onChange={e => setClinica({...clinica, slug: e.target.value})} />
                    </div>
                    <p className="text-xs text-muted-foreground">Atualiza automaticamente com o nome da clínica</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Endereço</Label>
                    <Input placeholder="Rua, número, bairro" value={clinica.endereco} onChange={e => setClinica({...clinica, endereco: e.target.value})} />
                  </div>
                  {/* FIX #5: CEP com busca automática */}
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <div className="relative">
                      <Input
                        placeholder="00000-000"
                        value={clinica.cep}
                        onChange={e => {
                          const val = e.target.value.replace(/\D/g, "").slice(0,8)
                          const formatted = val.length > 5 ? `${val.slice(0,5)}-${val.slice(5)}` : val
                          setClinica({...clinica, cep: formatted})
                          if (val.length === 8) buscarCep(val)
                        }}
                      />
                      {cepLoading && <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">Buscando...</span>}
                    </div>
                    <p className="text-xs text-muted-foreground">Cidade e estado preenchidos automaticamente</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* FIX #6: placeholder enganoso removido, mostra valor real */}
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input placeholder="Preenchido pelo CEP" value={clinica.cidade} onChange={e => setClinica({...clinica, cidade: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input placeholder="UF" maxLength={2} value={clinica.estado} onChange={e => setClinica({...clinica, estado: e.target.value.toUpperCase()})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Meta mensal (R$)</Label>
                  <Input type="number" placeholder="Ex: 30000" value={clinica.meta_mensal} onChange={e => setClinica({...clinica, meta_mensal: e.target.value})} className="max-w-xs" />
                  <p className="text-xs text-muted-foreground">Aparece na barra de progresso do módulo Financeiro</p>
                </div>
                <SaveButton id="clinica" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ABA PERFIL ===== */}
          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle>Seu perfil</CardTitle>
                <CardDescription>Informações do dentista responsável</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* FIX #7: Avatar clicável para upload */}
                <div className="flex items-center gap-5">
                  <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="Avatar" className="h-20 w-20 rounded-full object-cover border-2 border-[#00C9A7]" />
                    ) : (
                      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0A2540] text-2xl font-bold text-white">
                        {initials}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Foto de perfil</p>
                    <p className="text-xs text-muted-foreground">Clique no círculo para alterar</p>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome completo *</Label>
                    <Input
                      value={perfil.nome}
                      onChange={e => { setPerfil({...perfil, nome: e.target.value}); if (errors.nome) setErrors(p => ({...p, nome: ""})) }}
                      className={errors.nome ? "border-red-500" : ""}
                    />
                    {errors.nome && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle className="h-3 w-3" />{errors.nome}</p>}
                  </div>
                  {/* FIX #3: CRO salva e exibe corretamente com placeholder */}
                  <div className="space-y-2">
                    <Label>CRO</Label>
                    <Input
                      placeholder="Ex: CRO-SP 12345"
                      value={perfil.cro}
                      onChange={e => setPerfil({...perfil, cro: e.target.value})}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Especialidade</Label>
                    <Select value={perfil.especialidade} onValueChange={v => setPerfil({...perfil, especialidade: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinico">Clínico Geral</SelectItem>
                        <SelectItem value="ortodontia">Ortodontia</SelectItem>
                        <SelectItem value="implante">Implantodontia</SelectItem>
                        <SelectItem value="endo">Endodontia</SelectItem>
                        <SelectItem value="perio">Periodontia</SelectItem>
                        <SelectItem value="cirurgia">Cirurgia Oral</SelectItem>
                        <SelectItem value="pediatria">Odontopediatria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* FIX #4: máscara de telefone */}
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={perfil.telefone}
                      onChange={e => setPerfil({...perfil, telefone: maskPhone(e.target.value)})}
                      maxLength={15}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input disabled value={perfil.email} className="bg-muted" />
                  <p className="text-xs text-muted-foreground">O e-mail não pode ser alterado por aqui</p>
                </div>
                <SaveButton id="perfil" />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Alterar senha</CardTitle>
                <CardDescription>Defina uma nova senha de acesso</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nova senha</Label>
                    <Input type="password" placeholder="Mínimo 6 caracteres" value={senha.nova} onChange={e => setSenha({...senha, nova: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar senha</Label>
                    <Input type="password" placeholder="Repita a senha" value={senha.confirmar} onChange={e => setSenha({...senha, confirmar: e.target.value})} />
                  </div>
                </div>
                {msgSenha && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="h-4 w-4" />{msgSenha}</p>}
                <SaveButton id="senha" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===== ABA PLANO ===== */}
          <TabsContent value="plano">
            <Card>
              <CardHeader>
                <CardTitle>Seu plano</CardTitle>
                <CardDescription>Gerencie sua assinatura do DentistOS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* FIX #10 e #11: CTA + dias restantes */}
                <div className="rounded-xl border-2 border-[#00C9A7] bg-[#00C9A7]/5 p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <Badge className="bg-[#00C9A7] text-[#0A2540] mb-2">Trial gratuito</Badge>
                      <h3 className="text-2xl font-bold">DentistOS Pro</h3>
                      <p className="text-muted-foreground mt-1">
                        {trialDaysLeft !== null && trialDaysLeft > 0
                          ? <span className="font-medium text-amber-600">⏳ {trialDaysLeft} dias restantes no seu trial</span>
                          : trialDaysLeft === 0
                          ? <span className="font-medium text-red-500">⚠️ Seu trial expirou — assine para continuar</span>
                          : "Explore todos os recursos sem compromisso"}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0">
                      <Button className="bg-[#00C9A7] text-[#0A2540] font-bold hover:bg-[#00C9A7]/90 gap-2"
                        onClick={() => window.open("https://dentistos.vercel.app/assinar", "_blank")}>
                        Assinar agora — R$ 250/mês
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">Cancele a qualquer momento</p>
                    </div>
                  </div>
                  {trialDaysLeft !== null && trialDaysLeft > 0 && (
                    <div className="mt-4">
                      <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                        <span>Início do trial</span>
                        <span>{trialDaysLeft} dias restantes de 14</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div className="h-2 rounded-full bg-[#00C9A7] transition-all"
                          style={{ width: `${Math.max(0, ((14 - trialDaysLeft) / 14) * 100)}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Incluído no plano Pro:</h4>
                  <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                    {[
                      "Agenda inteligente",
                      "WhatsApp automático",
                      "Prontuário digital",
                      "Odontograma interativo",
                      "Financeiro completo",
                      "Gestão de pacientes",
                      "Reativação automática",
                      "Suporte prioritário",
                    ].map(item => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-[#00C9A7] shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-lg border bg-muted/50 p-4 text-sm text-muted-foreground">
                  <p>💳 <strong>Pagamento seguro</strong> via Mercado Pago. Após assinar, você pode gerenciar ou cancelar sua assinatura a qualquer momento pelo portal do cliente.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
