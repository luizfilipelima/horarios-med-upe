/**
 * Supabase Edge Function: meta-conversions
 *
 * Envia eventos para Meta Conversions API (CAPI) — server-side.
 * Complementa o Pixel no cliente para melhor atribuição.
 *
 * DEPLOY: supabase functions deploy meta-conversions --no-verify-jwt
 *
 * CONFIGURAR:
 *   supabase secrets set META_ACCESS_TOKEN=seu_token_aqui
 *   supabase secrets set META_PIXEL_ID=1294973712453116
 */

const META_GRAPH_URL = "https://graph.facebook.com/v21.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const accessToken = Deno.env.get("META_ACCESS_TOKEN");
    const pixelId = Deno.env.get("META_PIXEL_ID");

    if (!accessToken || !pixelId) {
      return new Response(
        JSON.stringify({ error: "META_ACCESS_TOKEN e META_PIXEL_ID devem estar configurados em supabase secrets" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const { event_name, event_source_url } = body;

    if (!event_name) {
      return new Response(
        JSON.stringify({ error: "event_name é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const payload = {
      data: [
        {
          event_name: String(event_name),
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: event_source_url || null,
          action_source: "website",
        },
      ],
      access_token: accessToken,
    };

    const url = `${META_GRAPH_URL}/${pixelId}/events`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: data.error?.message || "Erro ao enviar evento para Meta" }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify({ ok: true, events_received: data.events_received }), {
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
