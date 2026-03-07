/**
 * Supabase Edge Function: send-email
 *
 * Envia e-mails transacionais via Resend (sem uso de banco Supabase).
 * Chamada sem sessão (pós-signup, aprovação CEO). Requer --no-verify-jwt.
 *
 * DEPLOY: supabase functions deploy send-email --no-verify-jwt
 *
 * CONFIGURAR: supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
 */

const RESEND_API_URL = "https://api.resend.com/emails";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const FROM_EMAIL = "onboarding@resend.dev"; // Para testes. Em produção: noreply@seudominio.com

function buildPendingHtml(nome: string, turma: string): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;padding:32px;line-height:1.6">
  <div style="max-width:480px;margin:0 auto">
    <p style="font-size:24px;font-weight:700;color:#fff;margin-bottom:24px">Olá, ${nome}! 👋</p>
    <p style="margin:0 0 16px">Recebemos sua solicitação de acesso ao Gradly.</p>
    <p style="margin:0 0 24px">A turma <strong>${turma}</strong> foi registrada e está em análise. O acesso será liberado pelo administrador em breve.</p>
    <p style="margin:0;color:#94a3b8;font-size:14px">Você receberá um novo e-mail quando sua conta for aprovada.</p>
    <p style="margin:32px 0 0;font-size:12px;color:#64748b">Gradly — Organize sua vida acadêmica</p>
  </div>
</body>
</html>
  `.trim();
}

const WHATSAPP_FILIPE = "https://wa.me/5575992776610";

function buildApprovedHtml(nome: string, turma: string, link: string, turmaUrl?: string): string {
  const turmaBlock = turmaUrl
    ? `<p style="margin:0 0 8px;color:#94a3b8;font-size:14px">Sua turma: <strong style="color:#e2e8f0">${turma}</strong></p>
    <p style="margin:0 0 24px"><a href="${turmaUrl}" style="color:#6366f1;text-decoration:none">${turmaUrl}</a></p>`
    : `<p style="margin:0 0 24px">Sua turma: <strong>${turma}</strong></p>`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;padding:32px;line-height:1.6">
  <div style="max-width:480px;margin:0 auto">
    <p style="font-size:24px;font-weight:700;color:#fff;margin-bottom:24px">Cadastro confirmado, ${nome}! 🚀</p>
    <p style="margin:0 0 16px">Sua solicitação foi aprovada pelo administrador.</p>
    ${turmaBlock}
    <a href="${link}" style="display:inline-block;background:#6366f1;color:#fff;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:600;margin:16px 0">
      Acessar o Gradly
    </a>
    <p style="margin:32px 0 16px;padding:16px;background:rgba(255,255,255,0.05);border-radius:12px;font-size:14px">
      Dúvidas? Entre em contato com o Filipe pelo WhatsApp:<br>
      <a href="${WHATSAPP_FILIPE}" style="color:#25d366;text-decoration:none;font-weight:600">📱 WhatsApp do Filipe</a>
    </p>
    <p style="margin:0;font-size:12px;color:#64748b">Gradly — Organize sua vida acadêmica</p>
  </div>
</body>
</html>
  `.trim();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: "RESEND_API_KEY não configurada. Execute: supabase secrets set RESEND_API_KEY=re_xxx" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { type, email, nome, turma, link, turmaUrl } = body;

    if (!type || !email) {
      return new Response(
        JSON.stringify({ error: "type e email são obrigatórios" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    let subject: string;
    let html: string;

    if (type === "pending") {
      subject = "Seu acesso ao Gradly está em análise ⏳";
      html = buildPendingHtml(nome || "Delegado(a)", turma || "sua turma");
    } else if (type === "approved") {
      subject = "Cadastro confirmado! Bem-vindo ao Gradly 🚀";
      html = buildApprovedHtml(
        nome || "Delegado(a)",
        turma || "sua turma",
        link || "https://gradly.app/login",
        turmaUrl
      );
    } else {
      return new Response(
        JSON.stringify({ error: "type inválido. Use 'pending' ou 'approved'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const res = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: `Gradly <${FROM_EMAIL}>`,
        to: [String(email).trim().toLowerCase()],
        subject,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data.message || data.error || "Erro ao enviar e-mail" }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
