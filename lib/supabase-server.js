import { createClient } from "@supabase/supabase-js";

let serverClient;

export function getSupabaseServer() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) return null;
  if (!serverClient) {
    serverClient = createClient(url, publishableKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }
  return serverClient;
}

export function isMissingSchema(error) {
  return error?.code === "PGRST205" || error?.code === "42P01";
}

export function json(data, status = 200) {
  return Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function bodyAsJson(request) {
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 10000) throw new Error("PAYLOAD_TOO_LARGE");
  try {
    return await request.json();
  } catch {
    throw new Error("INVALID_JSON");
  }
}

export function text(value, maxLength) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}
