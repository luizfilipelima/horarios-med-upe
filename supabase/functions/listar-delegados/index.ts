/**
 * Edge Function: listar-delegados
 *
 * Lista delegados de uma turma. Usa Service Role para bypass RLS.
 * Deploy com --no-verify-jwt (JWT validado internamente).
 *
 * DEPLOY: supabase functions deploy listar-delegados --no-verify-jwt
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Método não permitido" }),
      { status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Não autorizado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const supabaseUser = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) {
      return new Response(
        JSON.stringify({ error: "Não autenticado" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: perfil } = await supabaseAdmin
      .from("perfis")
      .select("role")
      .eq("id", user.id)
      .single();

    if (perfil?.role !== "ceo") {
      return new Response(
        JSON.stringify({ error: "Acesso negado. Apenas CEO." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const turma_id = body?.turma_id;
    if (!turma_id) {
      return new Response(
        JSON.stringify({ error: "turma_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: perfis, error: perfisError } = await supabaseAdmin
      .from("perfis")
      .select("id, whatsapp")
      .eq("turma_id", turma_id)
      .eq("role", "delegado");

    if (perfisError) {
      return new Response(
        JSON.stringify({ error: perfisError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const delegados: { id: string; email: string; whatsapp: string | null }[] = [];
    for (const p of perfis ?? []) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(p.id);
      const email = userData?.user?.email ?? "";
      if (email) delegados.push({ id: p.id, email, whatsapp: p.whatsapp ?? null });
    }

    return new Response(
      JSON.stringify({ delegados }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
