import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const supabaseUrl = Deno.env.get("SUPABASE_URL")!
const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!

// --- Helpers ---
function montar(template: string, consulta: any): string {
  const dt = new Date(consulta.data_hora)
  return template
    .replace(/\{\{nome\}\}/g, consulta.pacientes?.nome || "")
    .replace(/\{\{data\}\}/g, dt.toLocaleDateString("pt-BR"))
    .replace(/\{\{hora\}\}/g, dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }))
    .replace(/\{\{procedimento\}\}/g, consulta.procedimentos_tipos?.nome || "Consulta")
}

async function enviarZApi(token: string, telefone: string, mensagem: string): Promise<boolean> {
  if (!telefone) return false
  const numero = telefone.replace(/\D/g, "")
  try {
    const res = await fetch(`https://api.z-api.io/instances/${token}/token/${token}/send-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone: `55${numero}`, message: mensagem }),
    })
    return res.ok
  } catch { return false }
}

async function jaEnviou(supabase: any, consultaId: string, tipo: string): Promise<boolean> {
  const { data } = await supabase
    .from("mensagens_whatsapp")
    .select("id")
    .eq("consulta_id", consultaId)
    .eq("tipo", tipo)
    .limit(1)
  return !!(data && data.length > 0)
}

async function registrar(
  supabase: any, tenantId: string, consultaId: string,
  pacienteId: string, conteudo: string, ok: boolean, tipo: string
) {
  await supabase.from("mensagens_whatsapp").insert({
    tenant_id: tenantId,
    consulta_id: consultaId,
    paciente_id: pacienteId,
    tipo,
    conteudo,
    status: ok ? "enviado" : "falha",
  })
}

// --- Handler principal ---
serve(async (_req) => {
  const supabase = createClient(supabaseUrl, supabaseKey)
  const agora = new Date()
  const em48h = new Date(agora.getTime() + 48 * 60 * 60 * 1000)
  const em2h  = new Date(agora.getTime() +  2 * 60 * 60 * 1000)

  function janela(dt: Date) {
    const i = new Date(dt); i.setMinutes(0, 0, 0)
    const f = new Date(dt); f.setMinutes(59, 59, 999)
    return { inicio: i.toISOString(), fim: f.toISOString() }
  }

  const j48 = janela(em48h)
  const j2  = janela(em2h)

  const { data: configs } = await supabase
    .from("configuracoes_clinica")
    .select("tenant_id, whatsapp_token, whatsapp_confirmacao_48h, whatsapp_lembrete_2h, whatsapp_template_confirmacao, whatsapp_template_lembrete")
    .not("whatsapp_token", "is", null)

  if (!configs?.length) {
    return new Response(JSON.stringify({ ok: true, msg: "Nenhum tenant configurado" }), { status: 200 })
  }

  let totalEnviadas = 0

  for (const cfg of configs) {
    if (!cfg.whatsapp_token) continue

    // CONFIRMACAO 48h antes
    if (cfg.whatsapp_confirmacao_48h) {
      const { data: consultas } = await supabase
        .from("consultas")
        .select("id, data_hora, paciente_id, pacientes(nome, telefone), procedimentos_tipos(nome)")
        .eq("tenant_id", cfg.tenant_id).eq("status", "agendada")
        .gte("data_hora", j48.inicio).lte("data_hora", j48.fim)

      for (const c of consultas || []) {
        if (await jaEnviou(supabase, c.id, "confirmacao_48h")) continue
        const msg = montar(cfg.whatsapp_template_confirmacao ||
          "Ola {{nome}}, sua consulta esta marcada para {{data}} as {{hora}}. Confirme respondendo SIM ou NAO.", c)
        const ok = await enviarZApi(cfg.whatsapp_token, (c.pacientes as any)?.telefone, msg)
        await registrar(supabase, cfg.tenant_id, c.id, c.paciente_id, msg, ok, "confirmacao_48h")
        if (ok) totalEnviadas++
      }
    }

    // LEMBRETE 2h antes
    if (cfg.whatsapp_lembrete_2h) {
      const { data: consultas } = await supabase
        .from("consultas")
        .select("id, data_hora, paciente_id, pacientes(nome, telefone), procedimentos_tipos(nome)")
        .eq("tenant_id", cfg.tenant_id).in("status", ["agendada", "confirmada"])
        .gte("data_hora", j2.inicio).lte("data_hora", j2.fim)

      for (const c of consultas || []) {
        if (await jaEnviou(supabase, c.id, "lembrete_2h")) continue
        const msg = montar(cfg.whatsapp_template_lembrete ||
          "Ola {{nome}}, sua consulta e hoje as {{hora}}. Estamos te esperando!", c)
        const ok = await enviarZApi(cfg.whatsapp_token, (c.pacientes as any)?.telefone, msg)
        await registrar(supabase, cfg.tenant_id, c.id, c.paciente_id, msg, ok, "lembrete_2h")
        if (ok) totalEnviadas++
      }
    }
  }

  return new Response(JSON.stringify({ ok: true, enviadas: totalEnviadas }), {
    headers: { "Content-Type": "application/json" }, status: 200
  })
})
