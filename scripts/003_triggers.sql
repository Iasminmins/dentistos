-- ================================================
-- DentistOS - Triggers e Funções
-- ================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Aplicar trigger de updated_at em todas as tabelas relevantes
CREATE TRIGGER set_updated_at_tenants
  BEFORE UPDATE ON public.tenants
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_pacientes
  BEFORE UPDATE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_consultas
  BEFORE UPDATE ON public.consultas
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_prontuarios
  BEFORE UPDATE ON public.prontuarios
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_dentes
  BEFORE UPDATE ON public.dentes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_lancamentos
  BEFORE UPDATE ON public.lancamentos_financeiros
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_config
  BEFORE UPDATE ON public.configuracoes_clinica
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ================================================
-- Função para criar tenant e profile no signup
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_tenant_id UUID;
  clinic_name TEXT;
  clinic_slug TEXT;
BEGIN
  -- Pegar nome da clínica dos metadados ou usar padrão
  clinic_name := COALESCE(NEW.raw_user_meta_data ->> 'clinic_name', 'Minha Clínica');
  clinic_slug := LOWER(REGEXP_REPLACE(clinic_name, '[^a-zA-Z0-9]', '-', 'g'));
  
  -- Garantir slug único
  clinic_slug := clinic_slug || '-' || SUBSTRING(NEW.id::text, 1, 8);
  
  -- Criar tenant
  INSERT INTO public.tenants (nome_clinica, slug)
  VALUES (clinic_name, clinic_slug)
  RETURNING id INTO new_tenant_id;
  
  -- Criar profile
  INSERT INTO public.profiles (
    id,
    tenant_id,
    nome,
    email,
    telefone,
    role
  )
  VALUES (
    NEW.id,
    new_tenant_id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    NEW.raw_user_meta_data ->> 'phone',
    'admin'
  )
  ON CONFLICT (id) DO NOTHING;
  
  -- Criar configurações padrão da clínica
  INSERT INTO public.configuracoes_clinica (tenant_id)
  VALUES (new_tenant_id)
  ON CONFLICT (tenant_id) DO NOTHING;
  
  -- Criar procedimentos padrão
  INSERT INTO public.procedimentos_tipos (tenant_id, nome, duracao_minutos, valor_padrao, cor)
  VALUES
    (new_tenant_id, 'Consulta Inicial', 60, 150.00, '#00C9A7'),
    (new_tenant_id, 'Limpeza', 45, 200.00, '#4ECDC4'),
    (new_tenant_id, 'Restauração', 60, 250.00, '#45B7D1'),
    (new_tenant_id, 'Extração', 45, 350.00, '#FF6B6B'),
    (new_tenant_id, 'Canal', 90, 800.00, '#F7DC6F'),
    (new_tenant_id, 'Clareamento', 90, 600.00, '#BB8FCE');

  RETURN NEW;
END;
$$;

-- Trigger para criar tenant/profile no signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ================================================
-- Função para criar lançamento financeiro ao concluir consulta
-- ================================================
CREATE OR REPLACE FUNCTION public.handle_consulta_concluida()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Se consulta foi concluída e tem valor
  IF NEW.status = 'concluida' AND OLD.status != 'concluida' AND NEW.valor IS NOT NULL AND NEW.valor > 0 THEN
    INSERT INTO public.lancamentos_financeiros (
      tenant_id,
      consulta_id,
      paciente_id,
      tipo,
      categoria,
      descricao,
      valor,
      data_vencimento,
      data_pagamento,
      status
    )
    SELECT
      NEW.tenant_id,
      NEW.id,
      NEW.paciente_id,
      'receita',
      COALESCE(pt.nome, 'Consulta'),
      'Consulta - ' || p.nome,
      NEW.valor,
      CURRENT_DATE,
      CURRENT_DATE,
      'pago'
    FROM public.pacientes p
    LEFT JOIN public.procedimentos_tipos pt ON pt.id = NEW.procedimento_tipo_id
    WHERE p.id = NEW.paciente_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_consulta_status_change
  AFTER UPDATE OF status ON public.consultas
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_consulta_concluida();
