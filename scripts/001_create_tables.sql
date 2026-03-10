-- ================================================
-- DentistOS - Schema Completo
-- ================================================

-- Tabela de Tenants (Clínicas)
CREATE TABLE IF NOT EXISTS public.tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_clinica TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  plano TEXT NOT NULL DEFAULT 'trial',
  status TEXT NOT NULL DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '14 days'),
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Profiles (Usuários)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cro TEXT,
  especialidade TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'admin',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Pacientes
CREATE TABLE IF NOT EXISTS public.pacientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  cpf TEXT,
  data_nascimento DATE,
  telefone TEXT NOT NULL,
  email TEXT,
  convenio TEXT,
  observacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Tipos de Procedimentos
CREATE TABLE IF NOT EXISTS public.procedimentos_tipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  duracao_minutos INTEGER NOT NULL DEFAULT 30,
  valor_padrao DECIMAL(10,2) NOT NULL DEFAULT 0,
  cor TEXT NOT NULL DEFAULT '#00C9A7',
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Consultas
CREATE TABLE IF NOT EXISTS public.consultas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  dentista_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  procedimento_tipo_id UUID REFERENCES public.procedimentos_tipos(id) ON DELETE SET NULL,
  data_hora TIMESTAMPTZ NOT NULL,
  duracao_minutos INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'agendada',
  observacoes TEXT,
  valor DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Prontuários
CREATE TABLE IF NOT EXISTS public.prontuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE SET NULL,
  dentista_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  anotacoes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Dentes (Odontograma)
CREATE TABLE IF NOT EXISTS public.dentes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prontuario_id UUID NOT NULL REFERENCES public.prontuarios(id) ON DELETE CASCADE,
  numero_dente INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'saudavel',
  observacoes TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Lançamentos Financeiros
CREATE TABLE IF NOT EXISTS public.lancamentos_financeiros (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE SET NULL,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  categoria TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento TEXT DEFAULT 'dinheiro',
  status TEXT NOT NULL DEFAULT 'pendente',
  data_vencimento DATE NOT NULL,
  data_pagamento DATE,
  parcela_atual INTEGER,
  total_parcelas INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Mensagens WhatsApp
CREATE TABLE IF NOT EXISTS public.mensagens_whatsapp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  paciente_id UUID NOT NULL REFERENCES public.pacientes(id) ON DELETE CASCADE,
  consulta_id UUID REFERENCES public.consultas(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'enviada',
  enviada_em TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Configurações da Clínica
CREATE TABLE IF NOT EXISTS public.configuracoes_clinica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID NOT NULL UNIQUE REFERENCES public.tenants(id) ON DELETE CASCADE,
  endereco TEXT,
  cidade TEXT,
  estado TEXT,
  cep TEXT,
  whatsapp_instance_id TEXT,
  whatsapp_conectado BOOLEAN DEFAULT FALSE,
  horarios_atendimento JSONB DEFAULT '{}',
  templates_mensagem JSONB DEFAULT '{}',
  meta_mensal DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.procedimentos_tipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consultas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensagens_whatsapp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_clinica ENABLE ROW LEVEL SECURITY;
