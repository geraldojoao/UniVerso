import { bodyAsJson, getSupabaseServer, isMissingSchema, json, text } from "../lib/supabase-server.js";

export async function POST(request) {
  let payload;
  try {
    payload = await bodyAsJson(request);
  } catch {
    return json({ error: "Dados inválidos." }, 400);
  }

  // Campo invisível: robôs que o preenchem recebem sucesso sem gravação.
  if (text(payload.website, 80)) return json({ ok: true }, 201);

  const name = text(payload.name, 100);
  const email = text(payload.email, 180).toLowerCase();
  const school = text(payload.school, 150);
  const message = text(payload.message, 1500);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (name.length < 3 || message.length < 10 || !emailPattern.test(email)) {
    return json({ error: "Preencha nome, e-mail válido e mensagem." }, 400);
  }

  const supabase = getSupabaseServer();
  if (!supabase) return json({ error: "Contato indisponível até a configuração do banco." }, 503);

  const { error } = await supabase.from("contact_messages").insert({
    name,
    email,
    school: school || null,
    message,
    source: "site"
  });

  if (error) {
    console.error("contact_messages insert failed", error.message);
    if (isMissingSchema(error)) return json({ error: "Banco ainda não preparado. Execute a migração do Supabase." }, 503);
    return json({ error: "Não foi possível registrar a mensagem agora." }, 500);
  }
  return json({ ok: true }, 201);
}
