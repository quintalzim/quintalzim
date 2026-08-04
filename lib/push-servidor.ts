// Lógica de envio de push compartilhada entre /api/push/enviar (push avulso,
// pedido por uma sessão logada) e /api/lembretes/agendamentos (varredura
// automática, chamada pelo n8n com PUSH_API_SECRET). Só roda no servidor —
// usa a service role key, nunca importar isso em código de cliente.
import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import webpush from "web-push";

export function configurarWebPush(): boolean {
  const chavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const chavePrivada = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!chavePublica || !chavePrivada || !subject) {
    return false;
  }

  webpush.setVapidDetails(subject, chavePublica, chavePrivada);
  return true;
}

export function clienteAdmin(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) return null;
  return createSupabaseClient(url, chave, { auth: { persistSession: false } });
}

export async function enviarPushParaProfile(
  admin: SupabaseClient,
  profileId: string,
  titulo: string,
  corpo: string,
  url = "/app/inicio"
): Promise<{ enviados: number; total: number }> {
  const { data: inscricoes, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("profile_id", profileId);

  if (error || !inscricoes || inscricoes.length === 0) {
    return { enviados: 0, total: inscricoes?.length ?? 0 };
  }

  const payload = JSON.stringify({ title: titulo, body: corpo, url });

  let enviados = 0;
  for (const inscricao of inscricoes) {
    try {
      await webpush.sendNotification(
        {
          endpoint: inscricao.endpoint,
          keys: { p256dh: inscricao.p256dh, auth: inscricao.auth },
        },
        payload
      );
      enviados += 1;
    } catch (err: unknown) {
      const status = (err as { statusCode?: number })?.statusCode;
      if (status === 404 || status === 410) {
        await admin.from("push_subscriptions").delete().eq("id", inscricao.id);
      }
    }
  }

  return { enviados, total: inscricoes.length };
}
