import { bodyAsJson, getSupabaseServer, isMissingSchema, json, text } from "../lib/supabase-server.js";

export async function GET() {
  const supabase = getSupabaseServer();
  if (!supabase) return json({ commitments: [], error: "Mural ainda não configurado." }, 503);

  const { data, error } = await supabase
    .from("commitments")
    .select("name,message")
    .eq("status", "approved")
    .order("approved_at", { ascending: false })
    .limit(6);

  if (error) {
    console.error("commitments read failed", error.message);
    if (isMissingSchema(error)) return json({ commitments: [], error: "Banco ainda não preparado. Execute a migração do Supabase." }, 503);
    return json({ commitments: [], error: "Não foi possível consultar o mural agora." }, 500);
  }
  return json({ commitments: data || [] });
}

export async function POST(request) {
  let payload;
  try {
    payload = await bodyAsJson(request);
  } catch {
    return json({ error: "Dados inválidos." }, 400);
  }

  if (text(payload.website, 80)) return json({ ok: true }, 201);

  const name = text(payload.name, 40);
  const message = text(payload.message, 180);
  if (name.length < 2 || message.length < 10) {
    return json({ error: "Informe seu primeiro nome e um compromisso válido." }, 400);
  }

  const supabase = getSupabaseServer();
  if (!supabase) return json({ error: "Mural indisponível até a configuração do banco." }, 503);

  const { error } = await supabase.from("commitments").insert({ name, message, status: "pending" });
  if (error) {
    console.error("commitments insert failed", error.message);
    if (isMissingSchema(error)) return json({ error: "Banco ainda não preparado. Execute a migração do Supabase." }, 503);
    return json({ error: "Não foi possível registrar seu compromisso agora." }, 500);
  }
  return json({ ok: true }, 201);
}
