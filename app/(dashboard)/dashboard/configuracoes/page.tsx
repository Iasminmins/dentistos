"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Building2, User, Clock, Bell, CreditCard, Shield, Palette, Save, CheckCircle2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function ConfiguracoesPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)
  const [saved, setSaved] = useState<string | null>(null)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [clinica, setClinica] = useState({ nome_clinica: "", slug: "", endereco: "", cidade: "", estado: "", cep: "", meta_mensal: "" })
  const [perfil, setPerfil] = useState({ nome: "", email: "", telefone: "", cro: "", especialidade: "clinico" })
  const [senha, setSenha] = useState({ nova: "", confirmar: "" })
  const [msgSenha, setMsgSenha] = useState("")

  useEffect(() => { initialize() }, [])

  async function initialize() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    setUserId(user.id)
    const { data: profile } = await supabase.from("profiles").select("*, tenants(*)").eq("id", user.id).single()
    if (!profile) return
    setTenantId(profile.tenant_id)
    setPerfil({ nome: profile.nome || "", email: profile.email || "", telefone: profile.telefone || "", cro: profile.cro || "", especialidade: profile.especialidade || "clinico" })
    const t = (profile as any).tenants
    if (t) setClinica({ nome_clinica: t.nome_clinica || "", slug: t.slug || "", endereco: "", cidade: "", estado: "", cep: "", meta_mensal: "" })
    const { data: config } = await supabase.from("configuracoes_clinica").select("*").eq("tenant_id", profile.tenant_id).single()
    if (config) setClinica(prev => ({ ...prev, endereco: config.endereco || "", cidade: config.cidade || "", estado: config.estado || "", cep: config.cep || "", meta_mensal: config.meta_mensal?.toString() || "" }))
    setLoading(false)
  }


  function showSaved(key: string) { setSaved(key); setTimeout(() => setSaved(null), 2500) }

  async function saveClinica() {
    if (!tenantId) return
    setSaving("clinica")
    await supabase.from("tenants").update({ nome_clinica: clinica.nome_clinica, slug: clinica.slug }).eq("id", tenantId)
    await supabase.from("configuracoes_clinica").update({ endereco: clinica.endereco, cidade: clinica.cidade, estado: clinica.estado, cep: clinica.cep, meta_mensal: clinica.meta_mensal ? parseFloat(clinica.meta_mensal) : null }).eq("tenant_id", tenantId)
    setSaving(null); showSaved("clinica")
  }

  async function savePerfil() {
    if (!userId) return
    setSaving("perfil")
    await supabase.from("profiles").update({ nome: perfil.nome, telefone: perfil.telefone, cro: perfil.cro, especialidade: perfil.especialidade }).eq("id", userId)
    setSaving(null); showSaved("perfil")
  }

  async function saveSenha() {
    if (senha.nova !== senha.confirmar) { setMsgSenha("As senhas nao coincidem"); return }
    if (senha.nova.length < 6) { setMsgSenha("Minimo 6 caracteres"); return }
    setSaving("senha")
    const { error } = await supabase.auth.updateUser({ password: senha.nova })
    setSaving(null)
    if (error) { setMsgSenha(error.message) } else { setMsgSenha(""); setSenha({ nova: "", confirmar: "" }); showSaved("senha") }
  }

  const SaveButton = ({ id }: { id: string }) => (
    <Button disabled={saving === id} className="bg-[#00C9A7] text-[#0A2540] hover:bg-[#00C9A7]/90"
      onClick={id === "clinica" ? saveClinica : id === "perfil" ? savePerfil : saveSenha}>
      {saved === id ? <><CheckCircle2 className="mr-2 h-4 w-4" /> Salvo!</> : saving === id ? "Salvando..." : <><Save className="mr-2 h-4 w-4" /> Salvar</>}
    </Button>
  )

  if (loading) return <div className="flex flex-col"><DashboardHeader title="Configuracoes" /><div className="p-8 text-center text-muted-foreground">Carregando...</div></div>

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Configuracoes" />
      <div className="flex-1 p-4 lg:p-6">
        <Tabs defaultValue="clinica" className="space-y-6">
          <TabsList className="flex-wrap">
            <TabsTrigger value="clinica"><Building2 className="mr-2 h-4 w-4" />Clinica</TabsTrigger>
            <TabsTrigger value="perfil"><User className="mr-2 h-4 w-4" />Perfil</TabsTrigger>
            <TabsTrigger value="plano"><CreditCard className="mr-2 h-4 w-4" />Plano</TabsTrigger>
          </TabsList>

          {/* Clinica */}
          <TabsContent value="clinica">
            <Card>
              <CardHeader><CardTitle>Dados da clinica</CardTitle><CardDescription>Informacoes que aparecem para seus pacientes</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome da clinica</Label>
                    <Input value={clinica.nome_clinica} onChange={e => setClinica({...clinica, nome_clinica: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Slug (link de agendamento)</Label>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground whitespace-nowrap">dentistos.com.br/agendar/</span>
                      <Input value={clinica.slug} onChange={e => setClinica({...clinica, slug: e.target.value})} />
                    </div>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Endereco</Label>
                    <Input placeholder="Rua, numero, bairro" value={clinica.endereco} onChange={e => setClinica({...clinica, endereco: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input placeholder="00000-000" value={clinica.cep} onChange={e => setClinica({...clinica, cep: e.target.value})} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Input placeholder="Sao Paulo" value={clinica.cidade} onChange={e => setClinica({...clinica, cidade: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Input placeholder="SP" maxLength={2} value={clinica.estado} onChange={e => setClinica({...clinica, estado: e.target.value.toUpperCase()})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Meta mensal (R$)</Label>
                  <Input type="number" placeholder="Ex: 30000" value={clinica.meta_mensal} onChange={e => setClinica({...clinica, meta_mensal: e.target.value})} className="max-w-xs" />
                  <p className="text-xs text-muted-foreground">Aparece na barra de progresso do modulo Financeiro</p>
                </div>
                <SaveButton id="clinica" />
              </CardContent>
            </Card>
          </TabsContent>


          {/* Perfil */}
          <TabsContent value="perfil">
            <Card>
              <CardHeader><CardTitle>Seu perfil</CardTitle><CardDescription>Informacoes do dentista responsavel</CardDescription></CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0A2540] text-2xl font-bold text-white">
                    {perfil.nome.split(" ").map(n => n[0]).join("").slice(0,2).toUpperCase() || "?"}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome completo</Label>
                    <Input value={perfil.nome} onChange={e => setPerfil({...perfil, nome: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>CRO</Label>
                    <Input placeholder="CRO-SP 12345" value={perfil.cro} onChange={e => setPerfil({...perfil, cro: e.target.value})} />
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Especialidade</Label>
                    <Select value={perfil.especialidade} onValueChange={v => setPerfil({...perfil, especialidade: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clinico">Clinico Geral</SelectItem>
                        <SelectItem value="ortodontia">Ortodontia</SelectItem>
                        <SelectItem value="implante">Implantodontia</SelectItem>
                        <SelectItem value="endo">Endodontia</SelectItem>
                        <SelectItem value="perio">Periodontia</SelectItem>
                        <SelectItem value="cirurgia">Cirurgia</SelectItem>
                        <SelectItem value="pediatria">Odontopediatria</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone</Label>
                    <Input placeholder="(11) 99999-9999" value={perfil.telefone} onChange={e => setPerfil({...perfil, telefone: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input disabled value={perfil.email} className="bg-muted" />
                  <p className="text-xs text-muted-foreground">O email nao pode ser alterado por aqui</p>
                </div>
                <SaveButton id="perfil" />
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader><CardTitle>Alterar senha</CardTitle><CardDescription>Defina uma nova senha de acesso</CardDescription></CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nova senha</Label>
                    <Input type="password" placeholder="Minimo 6 caracteres" value={senha.nova} onChange={e => setSenha({...senha, nova: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Confirmar senha</Label>
                    <Input type="password" placeholder="Repita a senha" value={senha.confirmar} onChange={e => setSenha({...senha, confirmar: e.target.value})} />
                  </div>
                </div>
                {msgSenha && <p className="text-sm text-red-500">{msgSenha}</p>}
                <SaveButton id="senha" />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Plano */}
          <TabsContent value="plano">
            <Card>
              <CardHeader><CardTitle>Seu plano</CardTitle><CardDescription>Gerencie sua assinatura</CardDescription></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between rounded-lg border-2 border-[#00C9A7] bg-[#00C9A7]/5 p-6">
                  <div>
                    <Badge className="bg-[#00C9A7] text-[#0A2540]">Trial gratuito</Badge>
                    <h3 className="mt-2 text-2xl font-bold">14 dias gratis</h3>
                    <p className="text-sm text-muted-foreground">Explore todos os recursos sem compromisso</p>
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <h4 className="font-semibold">Incluido no seu plano:</h4>
                  <ul className="grid grid-cols-2 gap-1 text-sm text-muted-foreground">
                    {["Agenda inteligente","WhatsApp automatico","Prontuario digital","Odontograma interativo","Financeiro completo","Gestao de pacientes","Reativacao automatica","Suporte prioritario"].map(item => (
                      <li key={item} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#00C9A7]" />{item}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}
