import { createClient } from "@/lib/supabase/client";

export type StatusNotificacoes =
  | "sem-suporte"
  | "negado"
  | "ativo"
  | "inativo";

function urlBase64ParaUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const base64Seguro = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const bruto = window.atob(base64Seguro);
  const saida = new Uint8Array(bruto.length);
  for (let i = 0; i < bruto.length; i++) {
    saida[i] = bruto.charCodeAt(i);
  }
  return saida;
}

export function suportaNotificacoes(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export async function statusAtualNotificacoes(): Promise<StatusNotificacoes> {
  if (!suportaNotificacoes()) return "sem-suporte";
  if (Notification.permission === "denied") return "negado";

  const registro = await navigator.serviceWorker.getRegistration();
  const inscricao = await registro?.pushManager.getSubscription();
  return inscricao ? "ativo" : "inativo";
}

export async function ativarNotificacoes(): Promise<{ ok: boolean; erro?: string }> {
  if (!suportaNotificacoes()) {
    return { ok: false, erro: "Esse navegador não suporta notificações." };
  }

  const chavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!chavePublica) {
    return { ok: false, erro: "Notificações ainda não configuradas por aqui." };
  }

  const permissao = await Notification.requestPermission();
  if (permissao !== "granted") {
    return { ok: false, erro: "Você precisa permitir notificações no navegador pra ativar." };
  }

  const registro = await navigator.serviceWorker.register("/sw.js");
  await navigator.serviceWorker.ready;

  let inscricao = await registro.pushManager.getSubscription();
  if (!inscricao) {
    inscricao = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ParaUint8Array(chavePublica),
    });
  }

  const bruta = inscricao.toJSON();
  const chaves = bruta.keys as { p256dh?: string; auth?: string } | undefined;
  if (!bruta.endpoint || !chaves?.p256dh || !chaves?.auth) {
    return { ok: false, erro: "Não consegui montar a inscrição. Tenta de novo." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, erro: "Sessão expirada. Entre novamente." };
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      profile_id: user.id,
      endpoint: bruta.endpoint,
      p256dh: chaves.p256dh,
      auth: chaves.auth,
    },
    { onConflict: "endpoint" }
  );

  if (error) {
    return { ok: false, erro: "Não consegui salvar a inscrição. Tenta de novo." };
  }

  return { ok: true };
}

export async function desativarNotificacoes(): Promise<void> {
  if (!suportaNotificacoes()) return;

  const registro = await navigator.serviceWorker.getRegistration();
  const inscricao = await registro?.pushManager.getSubscription();
  if (!inscricao) return;

  const endpoint = inscricao.endpoint;
  await inscricao.unsubscribe();

  const supabase = createClient();
  await supabase.from("push_subscriptions").delete().eq("endpoint", endpoint);
}
