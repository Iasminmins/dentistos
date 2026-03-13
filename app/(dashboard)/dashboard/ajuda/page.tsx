"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Search, Book, MessageCircle, Video, Mail, Phone, HelpCircle, Calendar, DollarSign, FileHeart, ChevronRight } from "lucide-react"

const articles: Record<string, { title: string; steps: string[] }> = {
  "Como configurar minha clínica": {
    title: "Como configurar minha clínica",
    steps: [
      "Acesse o menu lateral e clique em Configurações.",
      "Na aba Clínica, preencha o nome, endereco, cidade, estado e CEP.",
      "Defina uma meta mensal de receita para acompanhar no Financeiro.",
      "Clique em Salvar alterações — você verá a confirmação ✅ Salvo!",
    ],
  },
  "Adicionando sua primeira consulta": {
    title: "Adicionando sua primeira consulta",
    steps: [
      "Clique no botão verde + Nova consulta no canto superior direito.",
      "Busque o paciente pelo nome no campo de busca.",
      "Selecione a data, horário e o tipo de procedimento.",
      "Preencha o valor (preenchido automaticamente se tiver valor padrão).",
      "Clique em Agendar. A consulta aparece na grade da Agenda.",
    ],
  },
  "Cadastrando pacientes": {
    title: "Cadastrando pacientes",
    steps: [
      "Vá até a página Pacientes no menu lateral.",
      "Clique em Novo paciente no canto superior direito.",
      "Preencha nome e telefone (obrigatórios) e os demais dados.",
      "Selecione o convênio (padrão: Particular).",
      "Clique em Cadastrar. O paciente aparece na lista imediatamente.",
    ],
  },
  "Configurando horarios de atendimento": {
    title: "Configurando horários de atendimento",
    steps: [
      "Os horários visíveis na Agenda são fixos: 08h às 18h.",
      "Para personalizar, acesse Configurações > aba Clínica.",
      "Em breve: configuração de intervalos e horários bloqueados diretamente na Agenda.",
    ],
  },
  "Gerenciando agendamentos": {
    title: "Gerenciando agendamentos",
    steps: [
      "Acesse a página Agenda pelo menu lateral.",
      "Use os botões < e > para navegar entre semanas.",
      "Clique no botão Dia para ver a agenda de um único dia.",
      "Clique em qualquer consulta para ver detalhes e alterar o status.",
      "Status disponíveis: Agendada, Confirmada, Concluída e Faltou.",
    ],
  },
  "Configurando lembretes automáticos": {
    title: "Configurando lembretes automáticos",
    steps: [
      "Acesse a página WhatsApp no menu lateral.",
      "Clique em Configurar e insira seu token e número da Z-API.",
      "Ative as automações: Confirmação 48h, Lembrete 2h, etc.",
      "Os lembretes são disparados automaticamente a cada hora pelo sistema.",
      "Edite os templates de mensagem na seção Templates.",
    ],
  },
  "Bloqueando horarios": {
    title: "Bloqueando horários",
    steps: [
      "Funcionalidade de bloqueio de horários está em desenvolvimento.",
      "Por enquanto, deixe o horário sem consulta na grade semanal.",
      "Em breve: clique em horário vazio para bloquear ou adicionar observação.",
    ],
  },
  "Reagendando consultas": {
    title: "Reagendando consultas",
    steps: [
      "Acesse a Agenda e clique na consulta que deseja reagendar.",
      "No painel de detalhes, altere o status para a situação atual.",
      "Para mudar data/hora: crie uma nova consulta e marque a antiga como Cancelada.",
      "Em breve: edição direta de data e hora na consulta existente.",
    ],
  },
  "Cadastro completo de pacientes": {
    title: "Cadastro completo de pacientes",
    steps: [
      "Vá em Pacientes e clique no menu ⋯ ao lado do paciente.",
      "Selecione Editar para atualizar nome, CPF, email, nascimento, convênio.",
      "As alterações são salvas em tempo real no banco de dados.",
      "Para excluir, selecione Excluir — uma confirmação será solicitada antes.",
    ],
  },
  "Preenchendo o odontograma": {
    title: "Preenchendo o odontograma",
    steps: [
      "Acesse Prontuários e busque o paciente pelo nome ou telefone.",
      "Após selecionar, o odontograma com 32 dentes aparece na tela.",
      "Clique em qualquer dente para abrir o painel de edição.",
      "Selecione o status: Saudável, Cárie, Tratado, Extração, Implante ou Coroa.",
      "Adicione observações se necessário e clique em Salvar.",
    ],
  },
  "Adicionando procedimentos": {
    title: "Adicionando procedimentos ao histórico",
    steps: [
      "Com um paciente selecionado no Prontuários, role até Histórico de Consultas.",
      "Clique em Adicionar procedimento.",
      "Selecione o tipo de procedimento, data, horário e valor.",
      "Clique em Registrar procedimento — aparece no histórico imediatamente.",
    ],
  },
  "Histórico de atendimentos": {
    title: "Histórico de atendimentos",
    steps: [
      "Acesse Prontuários e busque o paciente.",
      "Na parte inferior da tela você verá todas as consultas registradas.",
      "Cada item mostra: procedimento, data, valor e status.",
      "O resumo do odontograma aparece na barra lateral direita.",
    ],
  },
  "Registrando pagamentos": {
    title: "Registrando pagamentos",
    steps: [
      "Acesse Financeiro no menu lateral.",
      "Clique em Novo no canto superior direito.",
      "Selecione Receita ou Despesa, descreva, informe valor e forma de pagamento.",
      "Defina o status como Pago ou Pendente.",
      "Clique em Salvar — o lançamento aparece na lista do mês atual.",
    ],
  },
  "Configurando meta mensal": {
    title: "Configurando meta mensal",
    steps: [
      "Acesse Configurações > aba Clínica.",
      "Preencha o campo Meta Mensal (R$) com o valor desejado.",
      "Clique em Salvar alterações.",
      "A barra de progresso no Financeiro será atualizada automaticamente.",
    ],
  },
  "Controlando pendencias": {
    title: "Controlando pendências",
    steps: [
      "No Financeiro, clique na aba Pendentes para filtrar não pagos.",
      "Você verá o total de lançamentos em aberto e o valor total.",
      "Clique no badge Pendente para marcar um lançamento como Pago.",
      "O valor é somado automaticamente à receita do mês.",
    ],
  },
  "Alternando status de pagamento": {
    title: "Alternando status de pagamento",
    steps: [
      "Na lista do Financeiro, localize o lançamento desejado.",
      "Clique no badge colorido (Pago ou Pendente) na coluna Status.",
      "O status alterna imediatamente e os totais são recalculados.",
    ],
  },
}

const categories = [
  { title: "Primeiros Passos", icon: Book, articles: ["Como configurar minha clínica","Adicionando sua primeira consulta","Cadastrando pacientes","Configurando horarios de atendimento"] },
  { title: "Agenda", icon: Calendar, articles: ["Gerenciando agendamentos","Configurando lembretes automáticos","Bloqueando horarios","Reagendando consultas"] },
  { title: "Pacientes & Prontuários", icon: FileHeart, articles: ["Cadastro completo de pacientes","Preenchendo o odontograma","Adicionando procedimentos","Histórico de atendimentos"] },
  { title: "Financeiro", icon: DollarSign, articles: ["Registrando pagamentos","Configurando meta mensal","Controlando pendencias","Alternando status de pagamento"] },
]

const faqs = [
  { question: "Como cancelar ou alterar o status de uma consulta?", answer: "Vá até a Agenda, clique na consulta e selecione o novo status (Confirmada, Concluída ou Faltou). O paciente pode ser notificado automaticamente via WhatsApp se a integração estiver ativa." },
  { question: "Posso usar o DentistOS no celular?", answer: "Sim! O DentistOS é totalmente responsivo e funciona perfeitamente em smartphones e tablets. Basta acessar pelo navegador do seu dispositivo." },
  { question: "Como configurar as mensagens automáticas do WhatsApp?", answer: "Vá até a página WhatsApp, clique em Configurar, insira seu token e número da Z-API e ative as automações. Você pode personalizar os templates com nome do paciente, data e horário." },
  { question: "Como funciona o odontograma?", answer: "Em Prontuários, busque o paciente e clique em qualquer dente. Um painel abrirá para selecionar o status (Saudável, Cárie, Tratado, Extração, Implante ou Coroa) e adicionar observações." },
  { question: "Como definir uma meta mensal de receita?", answer: "Vá em Configurações > aba Clínica e preencha o campo Meta Mensal (R$). A barra de progresso no Financeiro mostrará automaticamente o percentual atingido." },
  { question: "Como exportar ou fazer backup dos meus dados?", answer: "Seus dados ficam seguros com backup automático. Para exportar, entre em contato com nosso suporte via WhatsApp ou e-mail e geraremos um arquivo com todos os seus dados." },
  { question: "O que fazer se o WhatsApp parar de enviar mensagens?", answer: "Verifique se seu token Z-API ainda está ativo em app.z-api.io. Tokens expiram se o WhatsApp ficar desconectado. Reconecte pelo QR Code e atualize o token nas configurações do DentistOS." },
  { question: "Como adicionar um procedimento ao histórico do paciente?", answer: "Em Prontuários, selecione o paciente, role até Histórico de Consultas e clique em Adicionar procedimento. Preencha data, horário, tipo de procedimento e valor." },
]

export default function AjudaPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedArticle, setSelectedArticle] = useState<{ title: string; steps: string[] } | null>(null)

  const filteredFaqs = faqs.filter(f =>
    !searchQuery ||
    f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="flex flex-col">
      <DashboardHeader title="Ajuda & Suporte" />

      {/* Hero busca */}
      <div className="border-b bg-gradient-to-r from-[#0A2540] to-[#0d3060] px-6 py-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold text-white">Como podemos ajudar?</h2>
          <p className="mt-2 text-white/60">Encontre respostas rápidas ou fale com nosso suporte</p>
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input type="search" placeholder="Buscar em perguntas frequentes..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 bg-white pl-12 text-base" />
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 lg:p-6">
        <div className="mx-auto max-w-6xl space-y-8">

          {/* Atalhos rápidos */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => document.getElementById("categorias")?.scrollIntoView({ behavior: "smooth" })}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#00C9A7]/10">
                  <Book className="h-6 w-6 text-[#00C9A7]" />
                </div>
                <div><div className="font-semibold text-[#0A2540]">Documentação</div><div className="text-sm text-muted-foreground">Guias completos</div></div>
              </CardContent>
            </Card>

            <a href="https://wa.me/5524999327549?text=Oi!%20Preciso%20de%20ajuda%20com%20um%20video%20tutorial%20do%20DentistOS" target="_blank" rel="noopener noreferrer">
              <Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-red-50">
                    <Video className="h-6 w-6 text-red-600" />
                  </div>
                  <div><div className="font-semibold text-[#0A2540]">Video Tutoriais</div><div className="text-sm text-muted-foreground">Solicitar pelo WhatsApp</div></div>
                </CardContent>
              </Card>
            </a>

            <a href="https://wa.me/5524999327549" target="_blank" rel="noopener noreferrer">
              <Card className="cursor-pointer transition-shadow hover:shadow-md h-full">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50">
                    <MessageCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div><div className="font-semibold text-[#0A2540]">WhatsApp Suporte</div><div className="text-sm text-muted-foreground">Fale conosco agora</div></div>
                </CardContent>
              </Card>
            </a>

            <Card className="cursor-pointer transition-shadow hover:shadow-md"
              onClick={() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" })}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-50">
                  <HelpCircle className="h-6 w-6 text-amber-600" />
                </div>
                <div><div className="font-semibold text-[#0A2540]">FAQ</div><div className="text-sm text-muted-foreground">Perguntas frequentes</div></div>
              </CardContent>
            </Card>
          </div>

          {/* Categorias */}
          <div id="categorias">
            <h2 className="mb-4 text-xl font-semibold text-[#0A2540]">Categorias de Ajuda</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {categories.map((category) => (
                <Card key={category.title} className="overflow-hidden">
                  <CardHeader className="bg-muted/50 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#0A2540]">
                        <category.icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-base">{category.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <ul className="space-y-2">
                      {category.articles.map((key) => (
                        <li key={key}>
                          <button onClick={() => setSelectedArticle(articles[key])}
                            className="flex w-full items-center gap-2 text-sm text-muted-foreground hover:text-[#00C9A7] text-left transition-colors">
                            <ChevronRight className="h-3 w-3 shrink-0" />{key}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* FAQs */}
          <div id="faq-section">
            <Card>
              <CardHeader>
                <CardTitle>Perguntas Frequentes</CardTitle>
                <CardDescription>Respostas rápidas para as dúvidas mais comuns sobre o DentistOS</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredFaqs.length === 0 ? (
                  <p className="py-6 text-center text-muted-foreground">Nenhum resultado para "{searchQuery}"</p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, i) => (
                      <AccordionItem key={i} value={`item-${i}`}>
                        <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Contato */}
          <Card className="overflow-hidden bg-[#0A2540] text-white">
            <CardContent className="p-8">
              <div className="grid gap-8 lg:grid-cols-2">
                <div>
                  <h3 className="text-2xl font-bold">Ainda precisa de ajuda?</h3>
                  <p className="mt-2 text-white/60">Nossa equipe está pronta para te ajudar em qualquer canal abaixo.</p>
                  <div className="mt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                        <Mail className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Email</div>
                        <a href="mailto:iasminoliveiradl@gmail.com" className="font-medium hover:text-[#00C9A7] transition-colors">iasminoliveiradl@gmail.com</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                        <Phone className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">Telefone</div>
                        <a href="tel:+5524999327549" className="font-medium hover:text-[#00C9A7] transition-colors">(24) 99932-7549</a>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#00C9A7]/20">
                        <MessageCircle className="h-5 w-5 text-[#00C9A7]" />
                      </div>
                      <div>
                        <div className="text-xs text-white/50">WhatsApp</div>
                        <a href="https://wa.me/5524999327549" target="_blank" rel="noopener noreferrer" className="font-medium hover:text-[#00C9A7] transition-colors">(24) 99932-7549</a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-center">
                  <div className="rounded-xl bg-white/10 p-6">
                    <Badge className="bg-[#00C9A7] text-[#0A2540]">Horário de Atendimento</Badge>
                    <div className="mt-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-white/60">Segunda a Sexta</span><span className="font-medium">08:00 - 18:00</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Sábado</span><span className="font-medium">09:00 - 13:00</span></div>
                      <div className="flex justify-between"><span className="text-white/60">Domingo</span><span className="text-white/40">Fechado</span></div>
                    </div>
                    <div className="mt-6 flex flex-col gap-3">
                      <a href="https://wa.me/5524999327549" target="_blank" rel="noopener noreferrer">
                        <Button className="w-full bg-[#00C9A7] text-[#0A2540] hover:bg-[#00C9A7]/90">
                          <MessageCircle className="mr-2 h-4 w-4" />Chamar no WhatsApp
                        </Button>
                      </a>
                      <a href="mailto:iasminoliveiradl@gmail.com">
                        <Button variant="outline" className="w-full border-white/20 bg-white/10 text-white hover:bg-white/20">
                          <Mail className="mr-2 h-4 w-4" />Enviar Email
                        </Button>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>

      {/* Dialog artigo com passo a passo */}
      <Dialog open={!!selectedArticle} onOpenChange={() => setSelectedArticle(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedArticle?.title}</DialogTitle>
            <DialogDescription>Siga os passos abaixo</DialogDescription>
          </DialogHeader>
          <ol className="mt-2 space-y-3">
            {selectedArticle?.steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#00C9A7] text-xs font-bold text-[#0A2540]">{i + 1}</span>
                <span className="text-sm text-muted-foreground pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex justify-end">
            <Button onClick={() => setSelectedArticle(null)} className="bg-[#00C9A7] text-[#0A2540] hover:bg-[#00C9A7]/90">Entendido!</Button>
          </div>
        </DialogContent>
      </Dialog>

    </div>
  )
}
