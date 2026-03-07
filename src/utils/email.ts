/**
 * Utilitários de e-mail transacional — Gradly
 *
 * IMPORTANTE: As chaves de API (Resend, etc.) NUNCA devem ser expostas no frontend.
 * Estas funções devem ser chamadas apenas por:
 * - Edge Functions do Supabase (supabase/functions/*)
 * - API Routes (Next.js/Node) em um backend privado
 *
 * O frontend fará fetch para a Edge Function, que por sua vez chamará a API do Resend
 * com a chave armazenada em SUPABASE_SECRETS ou variáveis de ambiente do servidor.
 */

/**
 * Envia e-mail de boas-vindas para solicitação pendente.
 * Chamar após signUp no cadastro (via trigger ou Edge Function).
 *
 * ONDE CHAMAR: Edge Function "enviar-email-boas-vindas" (a criar)
 * ou no trigger handle_new_user_onboarding após o INSERT em perfis.
 *
 * Exemplo de chamada HTTP (NÃO fazer no frontend):
 * fetch('https://xxx.supabase.co/functions/v1/enviar-email-boas-vindas', {
 *   method: 'POST',
 *   headers: { 'Authorization': `Bearer ${session.access_token}`, 'Content-Type': 'application/json' },
 *   body: JSON.stringify({ email, nome })
 * })
 */
export async function sendWelcomePendingEmail(
  _email: string,
  _nome: string
): Promise<{ ok: boolean; error?: string }> {
  // TODO: Implementar na Edge Function. O Resend usa:
  // POST https://api.resend.com/emails
  // Headers: { Authorization: 'Bearer RE RESUMADO_API_KEY' }
  // Body: { from: 'Gradly <noreply@gradly.app>', to: email, subject: 'Solicitação recebida!', html: `...` }
  console.warn(
    '[email] sendWelcomePendingEmail: Chamar Edge Function ou API privada. Nunca chamar Resend direto do frontend.'
  );
  return { ok: true };
}

/**
 * Envia e-mail de aprovação quando o CEO aprova a solicitação.
 * Chamar após aprovar no painel (via Edge Function acionada pelo frontend).
 *
 * ONDE CHAMAR: Edge Function "enviar-email-aprovacao" (a criar)
 * O frontend chama: supabaseClient.functions.invoke('enviar-email-aprovacao', { body: { email, linkPainel } })
 *
 * A Edge Function faz o fetch para Resend com a chave em Deno.env.get('RESEND_API_KEY')
 */
export async function sendApprovalEmail(
  _email: string,
  _linkDoPainel: string
): Promise<{ ok: boolean; error?: string }> {
  // TODO: Implementar na Edge Function. Exemplo Resend:
  // const res = await fetch('https://api.resend.com/emails', {
  //   method: 'POST',
  //   headers: { 'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`, 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     from: 'Gradly <noreply@gradly.app>',
  //     to: email,
  //     subject: 'Seu acesso ao Gradly foi aprovado!',
  //     html: `<p>Olá! Sua solicitação foi aprovada. Acesse: <a href="${linkDoPainel}">${linkDoPainel}</a></p>`
  //   })
  // });
  console.warn(
    '[email] sendApprovalEmail: Chamar Edge Function enviar-email-aprovacao. Nunca expor RESEND_API_KEY no frontend.'
  );
  return { ok: true };
}
