/**
 * Edge Function: aprovar-solicitacao
 *
 * Aprova solicitação de delegado: obtém/cria turma, atualiza perfil com turma_id e status.
 * Usa SUPABASE_SERVICE_ROLE_KEY para bypass de RLS e garantir que o update persista.
 *
 * DEPLOY: supabase functions deploy aprovar-solicitacao --no-verify-jwt
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

    const { data: ceoPerfil } = await supabaseAdmin
      .from("perfis")
      .select("role")
      .eq("id", user.id)
      .single();

    if (ceoPerfil?.role !== "ceo") {
      return new Response(
        JSON.stringify({ error: "Acesso negado. Apenas CEO." }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body = await req.json();
    const perfilId = body?.perfil_id as string | undefined;
    const nomeTurma = body?.nome_turma as string | undefined;
    const slugDesejado = body?.slug_desejado as string | undefined;

    if (!perfilId || typeof perfilId !== "string") {
      return new Response(
        JSON.stringify({ error: "perfil_id obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data: perfilPendente } = await supabaseAdmin
      .from("perfis")
      .select("id, nome_turma, slug_desejado")
      .eq("id", perfilId)
      .eq("role", "delegado")
      .eq("status", "pendente")
      .single();

    if (!perfilPendente) {
      return new Response(
        JSON.stringify({ error: "Perfil não encontrado ou já foi processado." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const nome = (nomeTurma ?? perfilPendente.nome_turma ?? "").trim();
    const slugRaw = (slugDesejado ?? perfilPendente.slug_desejado ?? "").trim();
    const slug = slugRaw.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    if (!nome || !slug) {
      return new Response(
        JSON.stringify({ error: "nome_turma e slug_desejado são obrigatórios." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Buscar turma existente por slug
    const { data: turmaExistente } = await supabaseAdmin
      .from("turmas")
      .select("id")
      .eq("slug_url", slug)
      .maybeSingle();

    let turmaId: string;

    if (turmaExistente?.id) {
      turmaId = turmaExistente.id;
    } else {
      const { data: newTurma, error: errTurma } = await supabaseAdmin
        .from("turmas")
        .insert({ nome, faculdade: "", slug_url: slug })
        .select("id")
        .single();

      if (errTurma || !newTurma) {
        return new Response(
          JSON.stringify({ error: errTurma?.message ?? "Erro ao criar turma" }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      turmaId = newTurma.id;

      const { error: errConfig } = await supabaseAdmin
        .from("configuracoes")
        .insert({
          turma_id: turmaId,
          titulo: nome,
          subtitulo: "",
          link_drive: "",
          link_plataforma: "",
          ativar_sabado: false,
          ativar_domingo: false,
          idioma_dias: "pt",
          array_de_grupos: ["Grupo 1"],
        });

      if (errConfig) {
        return new Response(
          JSON.stringify({ error: "Erro ao criar configuração: " + errConfig.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // Atualiza o perfil do delegado: vincula à turma (criada ou existente) pelo slug que ele definiu
    const { data: perfilAtualizado, error: errPerfil } = await supabaseAdmin
      .from("perfis")
      .update({ status: "aprovado", turma_id: turmaId })
      .eq("id", perfilId)
      .select("id, turma_id")
      .single();

    if (errPerfil) {
      return new Response(
        JSON.stringify({ error: "Erro ao atualizar perfil: " + errPerfil.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    if (!perfilAtualizado?.turma_id) {
      return new Response(
        JSON.stringify({ error: "Perfil não foi vinculado à turma. Tente novamente." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, turma_id: turmaId, slug_url: slug }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
