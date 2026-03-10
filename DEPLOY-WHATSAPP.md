# Deploy da Edge Function — enviar-lembretes

## PRE-REQUISITO: Instalar o Supabase CLI

Se nao tiver instalado:
  npm install -g supabase

## PASSO 1 — Login no Supabase

  supabase login

(abre o browser, clica em "Authorize")

## PASSO 2 — Link com o projeto

  cd "C:\Users\letic\Downloads\projeto dentistos"
  supabase link --project-ref brxianqqkpktesknykup

## PASSO 3 — Deploy da function

  supabase functions deploy enviar-lembretes --no-verify-jwt

## PASSO 4 — Setar as variaveis de ambiente secretas

  supabase secrets set SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY

(pegue a Service Role Key em: Supabase > Settings > API > service_role)

## PASSO 5 — Testar manualmente

  curl -X POST https://brxianqqkpktesknykup.supabase.co/functions/v1/enviar-lembretes \
    -H "Authorization: Bearer SEU_ANON_KEY" \
    -H "Content-Type: application/json" \
    -d "{}"

Deve retornar: {"ok":true,"enviadas":0}

## PASSO 6 — Ativar o cron job

1. Va em: https://supabase.com/dashboard/project/brxianqqkpktesknykup/database/extensions
2. Procure "pg_cron" e ative
3. Va em SQL Editor e cole o PASSO 3 do arquivo supabase-setup-final.sql
   (substituindo SEU_ANON_KEY_AQUI pela sua anon key)

## COMO FUNCIONA DEPOIS

Todo inicio de hora o Supabase vai:
  1. Buscar consultas nas proximas 48h (janela de 1h) → envia confirmacao
  2. Buscar consultas nas proximas 2h  (janela de 1h) → envia lembrete
  3. Registrar cada envio em mensagens_whatsapp
  4. Nao reenviar se ja enviou (indice unico por consulta+tipo)

## ANON KEY do projeto

  eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJyeGlhbnFxa3BrdGVza255a3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMxNTQwOTQsImV4cCI6MjA4ODczMDA5NH0.VYz-Ej_2NO87NM5bW-meFoargpjyUx5tb6tvooH7pE4
