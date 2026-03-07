/**
 * Serviço de e-mail transacional — Gradly
 *
 * Chama a Supabase Edge Function send-email, que por sua vez
 * usa a API do Resend com a chave armazenada no servidor.
 * A API Key NUNCA é exposta no front-end.
 */

import { supabaseClient } from '../lib/supabase';

/**
 * Envia e-mail de confirmação de solicitação pendente.
 * Chamar após signUp ter sucesso na página de cadastro.
 */
export async function sendPendingEmail(
  email: string,
  nome: string,
  turma: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabaseClient.functions.invoke('send-email', {
      body: { type: 'pending', email, nome, turma },
    });

    if (error) return { ok: false, error: error.message };
    if (data?.error) return { ok: false, error: data.error };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erro ao enviar e-mail' };
  }
}

/**
 * Envia e-mail de aprovação quando o CEO libera o acesso.
 * Chamar após atualizar o status no banco na aprovação.
 */
export async function sendApprovalEmail(
  email: string,
  nome: string,
  turma: string,
  link: string,
  turmaUrl?: string
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data, error } = await supabaseClient.functions.invoke('send-email', {
      body: { type: 'approved', email, nome, turma, link, turmaUrl },
    });

    if (error) return { ok: false, error: error.message };
    if (data?.error) return { ok: false, error: data.error };

    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Erro ao enviar e-mail' };
  }
}
