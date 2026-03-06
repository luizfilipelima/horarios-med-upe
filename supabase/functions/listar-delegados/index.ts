import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { turma_id } = await req.json();
    if (!turma_id) {
      return new Response(
        JSON.stringify({ error: "turma_id é obrigatório" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { data: perfis, error: perfisError } = await supabaseAdmin
      .from("perfis")
      .select("id")
      .eq("turma_id", turma_id)
      .eq("role", "delegado");

    if (perfisError) {
      return new Response(
        JSON.stringify({ error: perfisError.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const delegados: { id: string; email: string }[] = [];
    for (const p of perfis ?? []) {
      const { data: userData } = await supabaseAdmin.auth.admin.getUserById(p.id);
      const email = userData?.user?.email ?? "";
      if (email) delegados.push({ id: p.id, email });
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
