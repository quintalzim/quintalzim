import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import webpush from "web-push";
import { createClient as createServerClient } from "@/lib/supabase/server";

function configurarWebPush() {
  const chavePublica = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const chavePrivada = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!chavePublica || !chavePrivada || !subject) {
    return false;
  }

  webpush.setVapidDetails(subject, chavePublica, chavePrivada);
  return true;
}

function clienteAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const chave = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !chave) return null;
  return createSupabaseClient(url, chave, { auth: { persistSession: false } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const profileId = body?.profileId as string | undefined;
  const titulo = (body?.titulo as string | undefined) || "Quintalzim";
  const corpo = (body?.corpo as string | undefined) || "";
  const url = (body?.url as string | undefined) || "/app/inicio";

  if (!profileId) {
    return NextResponse.json({ error: "profileId é obrigatório" }, { status: 400 });
  }

  const segredoEsperado = process.env.PUSH_API_SECRET;
  const segredoRecebido = request.headers.get("x-push-secret");
  const autorizadoPorSegredo = Boolean(segredoEsperado) && segredoRecebido === segredoEsperado;

  if (!autorizadoPorSegredo) {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.id !== profileId) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  if (!configurarWebPush()) {
    return NextResponse.json({ error: "Push não configurado no servidor" }, { status: 500 });
  }

  const admin = clienteAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Push não configurado no servidor" }, { status: 500 });
  }

  const { data: inscricoes, error } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("profile_id", profileId);

  if (error) {
    return NextResponse.json({ error: "Erro ao buscar inscrições" }, { status: 500 });
  }

  if (!inscricoes || inscricoes.length === 0) {
    return NextResponse.json({ enviados: 0, aviso: "Nenhuma inscrição ativa" });
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

  return NextResponse.json({ enviados, total: inscricoes.length });
}
