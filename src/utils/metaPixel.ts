/**
 * Meta Pixel + Conversions API
 *
 * O Pixel (fbq) roda no cliente. A Conversions API é chamada via Edge Function
 * para envio server-side (maior precisão, contorna bloqueadores).
 */

declare global {
  interface Window {
    fbq?: (action: string, event: string, params?: Record<string, unknown>) => void;
  }
}

/** Dispara evento Lead no Pixel (clique "Solicitar Acesso") */
export function trackLead(): void {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', 'Lead', { content_name: 'Solicitar Acesso - Landing' });
  }
}

/** Dispara evento Lead via Conversions API (server-side) */
export async function trackLeadServer(eventSourceUrl: string): Promise<void> {
  try {
    const { supabaseClient } = await import('../lib/supabase');
    await supabaseClient.functions.invoke('meta-conversions', {
      body: { event_name: 'Lead', event_source_url: eventSourceUrl },
    });
  } catch (e) {
    console.warn('Meta CAPI:', e);
  }
}
