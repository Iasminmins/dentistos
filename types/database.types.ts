export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          nome_clinica: string
          slug: string
          plano: 'basico' | 'pro' | 'clinica'
          status: 'ativo' | 'inativo' | 'trial'
          trial_ends_at: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome_clinica: string
          slug: string
          plano?: 'basico' | 'pro' | 'clinica'
          status?: 'ativo' | 'inativo' | 'trial'
          trial_ends_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome_clinica?: string
          slug?: string
          plano?: 'basico' | 'pro' | 'clinica'
          status?: 'ativo' | 'inativo' | 'trial'
          trial_ends_at?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          tenant_id: string
          nome: string
          email: string
          telefone: string | null
          cro: string | null
          especialidade: string | null
          avatar_url: string | null
          role: 'admin' | 'dentista' | 'secretaria'
          onboarding_completed: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tenant_id: string
          nome: string
          email: string
          telefone?: string | null
          cro?: string | null
          especialidade?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'dentista' | 'secretaria'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          nome?: string
          email?: string
          telefone?: string | null
          cro?: string | null
          especialidade?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'dentista' | 'secretaria'
          onboarding_completed?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      pacientes: {
        Row: {
          id: string
          tenant_id: string
          nome: string
          cpf: string | null
          data_nascimento: string | null
          telefone: string
          email: string | null
          convenio: string | null
          observacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          nome: string
          cpf?: string | null
          data_nascimento?: string | null
          telefone: string
          email?: string | null
          convenio?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          nome?: string
          cpf?: string | null
          data_nascimento?: string | null
          telefone?: string
          email?: string | null
          convenio?: string | null
          observacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      procedimentos_tipos: {
        Row: {
          id: string
          tenant_id: string
          nome: string
          duracao_minutos: number
          valor_padrao: number
          cor: string
          ativo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          nome: string
          duracao_minutos?: number
          valor_padrao?: number
          cor?: string
          ativo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          nome?: string
          duracao_minutos?: number
          valor_padrao?: number
          cor?: string
          ativo?: boolean
          created_at?: string
        }
      }
      consultas: {
        Row: {
          id: string
          tenant_id: string
          paciente_id: string
          dentista_id: string
          procedimento_tipo_id: string | null
          data_hora: string
          duracao_minutos: number
          status: 'agendada' | 'confirmada' | 'em_atendimento' | 'concluida' | 'cancelada' | 'falta'
          observacoes: string | null
          valor: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          paciente_id: string
          dentista_id: string
          procedimento_tipo_id?: string | null
          data_hora: string
          duracao_minutos?: number
          status?: 'agendada' | 'confirmada' | 'em_atendimento' | 'concluida' | 'cancelada' | 'falta'
          observacoes?: string | null
          valor?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          paciente_id?: string
          dentista_id?: string
          procedimento_tipo_id?: string | null
          data_hora?: string
          duracao_minutos?: number
          status?: 'agendada' | 'confirmada' | 'em_atendimento' | 'concluida' | 'cancelada' | 'falta'
          observacoes?: string | null
          valor?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      prontuarios: {
        Row: {
          id: string
          tenant_id: string
          paciente_id: string
          consulta_id: string | null
          dentista_id: string
          anotacoes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          paciente_id: string
          consulta_id?: string | null
          dentista_id: string
          anotacoes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          paciente_id?: string
          consulta_id?: string | null
          dentista_id?: string
          anotacoes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      dentes: {
        Row: {
          id: string
          prontuario_id: string
          numero_dente: number
          status: 'saudavel' | 'carie' | 'tratado' | 'extracao' | 'implante' | 'protese' | 'ausente'
          observacoes: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          prontuario_id: string
          numero_dente: number
          status?: 'saudavel' | 'carie' | 'tratado' | 'extracao' | 'implante' | 'protese' | 'ausente'
          observacoes?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          prontuario_id?: string
          numero_dente?: number
          status?: 'saudavel' | 'carie' | 'tratado' | 'extracao' | 'implante' | 'protese' | 'ausente'
          observacoes?: string | null
          updated_at?: string
        }
      }
      lancamentos_financeiros: {
        Row: {
          id: string
          tenant_id: string
          consulta_id: string | null
          paciente_id: string | null
          tipo: 'receita' | 'despesa'
          categoria: string
          descricao: string
          valor: number
          forma_pagamento: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'convenio'
          status: 'pendente' | 'pago' | 'cancelado'
          data_vencimento: string
          data_pagamento: string | null
          parcela_atual: number | null
          total_parcelas: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          consulta_id?: string | null
          paciente_id?: string | null
          tipo: 'receita' | 'despesa'
          categoria: string
          descricao: string
          valor: number
          forma_pagamento?: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'convenio'
          status?: 'pendente' | 'pago' | 'cancelado'
          data_vencimento: string
          data_pagamento?: string | null
          parcela_atual?: number | null
          total_parcelas?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          consulta_id?: string | null
          paciente_id?: string | null
          tipo?: 'receita' | 'despesa'
          categoria?: string
          descricao?: string
          valor?: number
          forma_pagamento?: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'convenio'
          status?: 'pendente' | 'pago' | 'cancelado'
          data_vencimento?: string
          data_pagamento?: string | null
          parcela_atual?: number | null
          total_parcelas?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      mensagens_whatsapp: {
        Row: {
          id: string
          tenant_id: string
          paciente_id: string
          consulta_id: string | null
          tipo: 'confirmacao' | 'lembrete' | 'reativacao' | 'manual'
          mensagem: string
          status: 'enviada' | 'entregue' | 'lida' | 'erro'
          enviada_em: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          paciente_id: string
          consulta_id?: string | null
          tipo: 'confirmacao' | 'lembrete' | 'reativacao' | 'manual'
          mensagem: string
          status?: 'enviada' | 'entregue' | 'lida' | 'erro'
          enviada_em?: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          paciente_id?: string
          consulta_id?: string | null
          tipo?: 'confirmacao' | 'lembrete' | 'reativacao' | 'manual'
          mensagem?: string
          status?: 'enviada' | 'entregue' | 'lida' | 'erro'
          enviada_em?: string
          created_at?: string
        }
      }
      configuracoes_clinica: {
        Row: {
          id: string
          tenant_id: string
          endereco: string | null
          cidade: string | null
          estado: string | null
          cep: string | null
          whatsapp_instance_id: string | null
          whatsapp_conectado: boolean
          horarios_atendimento: Json
          templates_mensagem: Json
          meta_mensal: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          whatsapp_instance_id?: string | null
          whatsapp_conectado?: boolean
          horarios_atendimento?: Json
          templates_mensagem?: Json
          meta_mensal?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          endereco?: string | null
          cidade?: string | null
          estado?: string | null
          cep?: string | null
          whatsapp_instance_id?: string | null
          whatsapp_conectado?: boolean
          horarios_atendimento?: Json
          templates_mensagem?: Json
          meta_mensal?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      plano_tipo: 'basico' | 'pro' | 'clinica'
      status_tenant: 'ativo' | 'inativo' | 'trial'
      role_tipo: 'admin' | 'dentista' | 'secretaria'
      consulta_status: 'agendada' | 'confirmada' | 'em_atendimento' | 'concluida' | 'cancelada' | 'falta'
      dente_status: 'saudavel' | 'carie' | 'tratado' | 'extracao' | 'implante' | 'protese' | 'ausente'
      lancamento_tipo: 'receita' | 'despesa'
      pagamento_forma: 'dinheiro' | 'pix' | 'cartao_credito' | 'cartao_debito' | 'boleto' | 'convenio'
      lancamento_status: 'pendente' | 'pago' | 'cancelado'
      mensagem_tipo: 'confirmacao' | 'lembrete' | 'reativacao' | 'manual'
      mensagem_status: 'enviada' | 'entregue' | 'lida' | 'erro'
    }
  }
}

export type Tenant = Database['public']['Tables']['tenants']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Paciente = Database['public']['Tables']['pacientes']['Row']
export type ProcedimentoTipo = Database['public']['Tables']['procedimentos_tipos']['Row']
export type Consulta = Database['public']['Tables']['consultas']['Row']
export type Prontuario = Database['public']['Tables']['prontuarios']['Row']
export type Dente = Database['public']['Tables']['dentes']['Row']
export type LancamentoFinanceiro = Database['public']['Tables']['lancamentos_financeiros']['Row']
export type MensagemWhatsapp = Database['public']['Tables']['mensagens_whatsapp']['Row']
export type ConfiguracaoClinica = Database['public']['Tables']['configuracoes_clinica']['Row']

// Tipos com relacionamentos
export type ConsultaComRelacoes = Consulta & {
  paciente: Paciente
  dentista: Profile
  procedimento_tipo: ProcedimentoTipo | null
}

export type PacienteComConsultas = Paciente & {
  consultas: Consulta[]
  total_consultas: number
  ultima_consulta: string | null
}
