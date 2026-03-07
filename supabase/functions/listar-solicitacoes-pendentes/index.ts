import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SolicitacaoPendente {
  id: string;
  email: string;
  nome_completo: string | null;
  nome_turma: string | null;
  slug_desejado: string | null;
  whatsapp: string | null;
  created_at: string | null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
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

    const { data: perfis, error } = await supabaseAdmin
      .from("perfis")
      .select("id, nome_completo, nome_turma, slug_desejado, whatsapp, status")
      .eq("role", "delegado")
      .eq("status", "pendente")
      .order("id");

    if (error) {
      return new Response(
        JSON.stringify({ error: error.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const solicitacoes: SolicitacaoPendente[] = [];
    for (const p of perfis ?? []) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(p.id);
      solicitacoes.push({
        id: p.id,
        email: userData?.user?.email ?? "",
        nome_completo: p.nome_completo,
        nome_turma: p.nome_turma,
        slug_desejado: p.slug_desejado,
        whatsapp: p.whatsapp,
        created_at: null,
      });
    }

    return new Response(
      JSON.stringify({ solicitacoes }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
