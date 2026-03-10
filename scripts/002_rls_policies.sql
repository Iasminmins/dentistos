-- ================================================
-- DentistOS - Row Level Security Policies
-- ================================================

-- Habilitar RLS em todas as tabelas
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

-- Função helper para pegar tenant_id do usuário atual
CREATE OR REPLACE FUNCTION public.get_current_tenant_id()
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid()
$$;

-- ================================================
-- TENANTS POLICIES
-- ================================================
CREATE POLICY "tenants_select_own" ON public.tenants
  FOR SELECT USING (id = public.get_current_tenant_id());

CREATE POLICY "tenants_update_own" ON public.tenants
  FOR UPDATE USING (id = public.get_current_tenant_id());

-- ================================================
-- PROFILES POLICIES
-- ================================================
CREATE POLICY "profiles_select_own_tenant" ON public.profiles
  FOR SELECT USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

-- ================================================
-- PACIENTES POLICIES
-- ================================================
CREATE POLICY "pacientes_select_own_tenant" ON public.pacientes
  FOR SELECT USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "pacientes_insert_own_tenant" ON public.pacientes
  FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "pacientes_update_own_tenant" ON public.pacientes
  FOR UPDATE USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "pacientes_delete_own_tenant" ON public.pacientes
  FOR DELETE USING (tenant_id = public.get_current_tenant_id());

-- ================================================
-- PROCEDIMENTOS_TIPOS POLICIES
-- ================================================
CREATE POLICY "procedimentos_select_own_tenant" ON public.procedimentos_tipos
  FOR SELECT USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "procedimentos_insert_own_tenant" ON public.procedimentos_tipos
  FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "procedimentos_update_own_tenant" ON public.procedimentos_tipos
  FOR UPDATE USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "procedimentos_delete_own_tenant" ON public.procedimentos_tipos
  FOR DELETE USING (tenant_id = public.get_current_tenant_id());

-- ================================================
-- CONSULTAS POLICIES
-- ================================================
CREATE POLICY "consultas_select_own_tenant" ON public.consultas
  FOR SELECT USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "consultas_insert_own_tenant" ON public.consultas
  FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "consultas_update_own_tenant" ON public.consultas
  FOR UPDATE USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "consultas_delete_own_tenant" ON public.consultas
  FOR DELETE USING (tenant_id = public.get_current_tenant_id());

-- ================================================
-- PRONTUARIOS POLICIES
-- ================================================
CREATE POLICY "prontuarios_select_own_tenant" ON public.prontuarios
  FOR SELECT USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "prontuarios_insert_own_tenant" ON public.prontuarios
  FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "prontuarios_update_own_tenant" ON public.prontuarios
  FOR UPDATE USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "prontuarios_delete_own_tenant" ON public.prontuarios
  FOR DELETE USING (tenant_id = public.get_current_tenant_id());

-- ================================================
-- DENTES POLICIES (via prontuario)
-- ================================================
CREATE POLICY "dentes_select_via_prontuario" ON public.dentes
  FOR SELECT USING (
    prontuario_id IN (
      SELECT id FROM public.prontuarios WHERE tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "dentes_insert_via_prontuario" ON public.dentes
  FOR INSERT WITH CHECK (
    prontuario_id IN (
      SELECT id FROM public.prontuarios WHERE tenant_id = public.get_current_tenant_id()
    )
  );

CREATE POLICY "dentes_update_via_prontuario" ON public.dentes
  FOR UPDATE USING (
    prontuario_id IN (
      SELECT id FROM public.prontuarios WHERE tenant_id = public.get_current_tenant_id()
    )
  );

-- ================================================
-- LANCAMENTOS_FINANCEIROS POLICIES
-- ================================================
CREATE POLICY "lancamentos_select_own_tenant" ON public.lancamentos_financeiros
  FOR SELECT USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "lancamentos_insert_own_tenant" ON public.lancamentos_financeiros
  FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "lancamentos_update_own_tenant" ON public.lancamentos_financeiros
  FOR UPDATE USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "lancamentos_delete_own_tenant" ON public.lancamentos_financeiros
  FOR DELETE USING (tenant_id = public.get_current_tenant_id());

-- ================================================
-- MENSAGENS_WHATSAPP POLICIES
-- ================================================
CREATE POLICY "mensagens_select_own_tenant" ON public.mensagens_whatsapp
  FOR SELECT USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "mensagens_insert_own_tenant" ON public.mensagens_whatsapp
  FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id());

-- ================================================
-- CONFIGURACOES_CLINICA POLICIES
-- ================================================
CREATE POLICY "config_select_own_tenant" ON public.configuracoes_clinica
  FOR SELECT USING (tenant_id = public.get_current_tenant_id());

CREATE POLICY "config_insert_own_tenant" ON public.configuracoes_clinica
  FOR INSERT WITH CHECK (tenant_id = public.get_current_tenant_id());

CREATE POLICY "config_update_own_tenant" ON public.configuracoes_clinica
  FOR UPDATE USING (tenant_id = public.get_current_tenant_id());
