-- Cole isso no SQL Editor do Supabase (Dashboard > SQL Editor)
-- Adiciona colunas de WhatsApp na tabela configuracoes_clinica

ALTER TABLE configuracoes_clinica
  ADD COLUMN IF NOT EXISTS whatsapp_token TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_numero TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_confirmacao_48h BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_lembrete_2h BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_reativacao BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_aniversario BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_template_confirmacao TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_template_lembrete TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_template_reativacao TEXT;

-- Adiciona coluna meta_mensal se nao existir
ALTER TABLE configuracoes_clinica
  ADD COLUMN IF NOT EXISTS meta_mensal NUMERIC(10,2);

-- Adiciona campos de endereco se nao existirem
ALTER TABLE configuracoes_clinica
  ADD COLUMN IF NOT EXISTS endereco TEXT,
  ADD COLUMN IF NOT EXISTS cidade TEXT,
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS cep TEXT;
