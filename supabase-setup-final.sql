-- ============================================================
-- PASSO 1 — Cole isso no SQL Editor do Supabase e clique Run
-- ============================================================

-- Colunas WhatsApp + config clinica
ALTER TABLE configuracoes_clinica
  ADD COLUMN IF NOT EXISTS whatsapp_token TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_numero TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_confirmacao_48h BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_lembrete_2h BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_reativacao BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_aniversario BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS whatsapp_template_confirmacao TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_template_lembrete TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_template_reativacao TEXT,
  ADD COLUMN IF NOT EXISTS meta_mensal NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS endereco TEXT,
  ADD COLUMN IF NOT EXISTS cidade TEXT,
  ADD COLUMN IF NOT EXISTS estado TEXT,
  ADD COLUMN IF NOT EXISTS cep TEXT;

-- Colunas extras no perfil do dentista
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS cro TEXT,
  ADD COLUMN IF NOT EXISTS especialidade TEXT;

-- Coluna tipo e consulta_id em mensagens_whatsapp (para anti-duplicata)
ALTER TABLE mensagens_whatsapp
  ADD COLUMN IF NOT EXISTS tipo TEXT,
  ADD COLUMN IF NOT EXISTS consulta_id UUID REFERENCES consultas(id) ON DELETE SET NULL;

-- Indice para evitar duplicatas de envio
CREATE UNIQUE INDEX IF NOT EXISTS idx_mensagens_wpp_consulta_tipo
  ON mensagens_whatsapp(consulta_id, tipo)
  WHERE consulta_id IS NOT NULL AND status != 'falha';

-- ============================================================
-- PASSO 2 — Ativar o pg_cron (so precisa fazer uma vez)
-- Va em: Database > Extensions > procure "pg_cron" > Enable
-- ============================================================

-- ============================================================
-- PASSO 3 — Criar o cron job (roda a Edge Function todo hora)
-- Cole isso separado depois de ativar o pg_cron
-- ============================================================

SELECT cron.schedule(
  'enviar-lembretes-whatsapp',   -- nome do job
  '0 * * * *',                   -- todo inicio de hora
  $$
    SELECT net.http_post(
      url    := 'https://brxianqqkpktesknykup.supabase.co/functions/v1/enviar-lembretes',
      headers := '{"Authorization": "Bearer SEU_ANON_KEY_AQUI", "Content-Type": "application/json"}'::jsonb,
      body   := '{}'::jsonb
    );
  $$
);

-- Para verificar se o job foi criado:
-- SELECT * FROM cron.job;

-- Para remover o job se precisar:
-- SELECT cron.unschedule('enviar-lembretes-whatsapp');
