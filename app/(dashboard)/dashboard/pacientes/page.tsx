"use client"

import { useState, useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, MoreHorizontal, User, Phone, Mail, Calendar, FileText, MessageCircle, Eye, Pencil, Trash2, Users, UserPlus, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type Paciente = {
  id: string; nome: string; telefone: string; email?: string; cpf?: string
  data_nascimento?: string; convenio?: string; observacoes?: string
  created_at: string; tenant_id: string
}

const emptyForm = { nome: "", telefone: "", email: "", cpf: "", data_nascimento: "", convenio: "particular", observacoes: "" }

export default function PacientesPage() {
  const supabase = createClient()
  const [pacientes, setPacientes] = useState<Paciente[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("todos")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPaciente, setEditingPaciente] = useState<Paciente | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => { loadPacientes() }, [])

  async function loadPacientes() {
    setLoading(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: profile } = await supabase.from("profiles").select("tenant_id").eq("id", user.id).single()
    if (!profile) return
    setTenantId(profile.tenant_id)
    const { data } = await supabase.from("pacientes").select("*")
      .eq("tenant_id", profile.tenant_id).order("nome", { ascending: true })
    if (data) setPacientes(data)
    setLoading(false)
  }

  function openNew() { setEditingPaciente(null); setForm(emptyForm); setIsDialogOpen(true) }
  function openEdit(p: Paciente) {
    setEditingPaciente(p)
    setForm({ nome: p.nome, telefone: p.telefone, email: p.email || "", cpf: p.cpf || "",
      data_nascimento: p.data_nascimento || "", convenio: p.convenio || "particular", observacoes: p.observacoes || "" })
    setIsDialogOpen(true)
  }

  async function handleSave() {
    if (!form.nome || !form.telefone || !tenantId) return
    setSaving(true)
    try {
      if (editingPaciente) {
        await supabase.from("pacientes").update({ ...form }).eq("id", editingPaciente.id)
      } else {
        await supabase.from("pacientes").insert({ ...form, tenant_id: tenantId })
      }
      await loadPacientes()
      setIsDialogOpen(false)
    } finally { setSaving(false) }
  }

  async function handleDelete(id: string) {
    await supabase.from("pacientes").delete().eq("id", id)
    setDeleteConfirm(null)
    await loadPacientes()
  }


  const filtered = pacientes.filter((p) => {
    const matchSearch = p.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.telefone.includes(searchQuery) || (p.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    return matchSearch
  })

  const statsData = [
    { label: "Total de pacientes", value: pacientes.length, icon: Users, color: "bg-blue-500" },
    { label: "Cadastrados este mes", value: pacientes.filter(p => new Date(p.created_at).getMonth() === new Date().getMonth()).length, icon: UserPlus, color: "bg-emerald-500" },
    { label: "Sem consulta recente", value: 0, icon: Clock, color: "bg-amber-500" },
  ]

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Pacientes" />
      <div className="flex-1 p-4 lg:p-6">

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          {statsData.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{loading ? "..." : stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filtros + Botão Novo */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nome, telefone ou email..." value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Button onClick={openNew} className="gap-2 bg-[#00C9A7] text-[#0A2540] hover:bg-[#00C9A7]/90">
            <Plus className="h-4 w-4" /> Novo paciente
          </Button>
        </div>


        {/* Tabela */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <p className="py-12 text-center text-muted-foreground">Carregando pacientes...</p>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center">
                <Users className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">{searchQuery ? "Nenhum paciente encontrado" : "Nenhum paciente cadastrado ainda"}</p>
                {!searchQuery && <Button onClick={openNew} className="mt-4 bg-[#00C9A7] text-[#0A2540]">Cadastrar primeiro paciente</Button>}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Paciente</TableHead>
                    <TableHead className="hidden md:table-cell">Telefone</TableHead>
                    <TableHead className="hidden lg:table-cell">Convênio</TableHead>
                    <TableHead className="hidden lg:table-cell">Cadastrado em</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="cursor-pointer hover:bg-muted/50" onClick={() => openEdit(p)}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-semibold text-sm">
                            {p.nome.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium">{p.nome}</div>
                            <div className="text-sm text-muted-foreground">{p.email || ""}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{p.telefone}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline">{p.convenio || "Particular"}</Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                        {new Date(p.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" onClick={e => e.stopPropagation()}><MoreHorizontal className="h-4 w-4" /></Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={e => { e.stopPropagation(); openEdit(p) }}>
                              <Pencil className="mr-2 h-4 w-4" /> Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={e => e.stopPropagation()}>
                              <Calendar className="mr-2 h-4 w-4" /> Agendar consulta
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600" onClick={e => { e.stopPropagation(); setDeleteConfirm(p.id) }}>
                              <Trash2 className="mr-2 h-4 w-4" /> Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="mt-4 flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filtered.length} paciente{filtered.length !== 1 ? "s" : ""} encontrado{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>


        {/* Dialog Criar/Editar */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingPaciente ? "Editar paciente" : "Cadastrar novo paciente"}</DialogTitle>
              <DialogDescription>{editingPaciente ? "Atualize os dados do paciente abaixo" : "Preencha os dados para cadastrar um novo paciente"}</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Nome completo *</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Nome do paciente" className="pl-9" value={form.nome}
                    onChange={e => setForm({...form, nome: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label>CPF</Label>
                  <Input placeholder="000.000.000-00" value={form.cpf}
                    onChange={e => setForm({...form, cpf: e.target.value})} />
                </div>
                <div className="grid gap-2">
                  <Label>Data de nascimento</Label>
                  <Input type="date" value={form.data_nascimento}
                    onChange={e => setForm({...form, data_nascimento: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Telefone *</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="(11) 99999-9999" className="pl-9" value={form.telefone}
                    onChange={e => setForm({...form, telefone: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" placeholder="email@exemplo.com" className="pl-9" value={form.email}
                    onChange={e => setForm({...form, email: e.target.value})} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Convênio</Label>
                <Select value={form.convenio} onValueChange={v => setForm({...form, convenio: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="particular">Particular</SelectItem>
                    <SelectItem value="amil">Amil</SelectItem>
                    <SelectItem value="bradesco">Bradesco</SelectItem>
                    <SelectItem value="sulamerica">SulAmerica</SelectItem>
                    <SelectItem value="unimed">Unimed</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Observações</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Alergias, restrições, etc." className="pl-9" value={form.observacoes}
                    onChange={e => setForm({...form, observacoes: e.target.value})} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancelar</Button>
              <Button disabled={saving || !form.nome || !form.telefone}
                className="bg-[#00C9A7] text-[#0A2540] hover:bg-[#00C9A7]/90" onClick={handleSave}>
                {saving ? "Salvando..." : editingPaciente ? "Salvar alteracoes" : "Cadastrar"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Dialog Confirmar Exclusao */}
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader><DialogTitle>Confirmar exclusao</DialogTitle><DialogDescription>Esta acao não pode ser desfeita.</DialogDescription></DialogHeader>
            <p className="text-sm text-muted-foreground py-4">
              Tem certeza que deseja excluir este paciente? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancelar</Button>
              <Button variant="destructive" onClick={() => deleteConfirm && handleDelete(deleteConfirm)}>
                Excluir
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </div>
  )
}
