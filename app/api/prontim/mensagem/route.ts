import { NextRequest, NextResponse } from "next/server";
import { clienteAdmin } from "@/lib/push-servidor";
import { createClient as createServerClient } from "@/lib/supabase/server";

const URL_WEBHOOK_N8N = "https://n8n.quintalzim.com.br/webhook/prontim-chat-web";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let corpo: { mensagem?: string };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const mensagem = corpo.mensagem?.trim();
  if (!mensagem) {
    return NextResponse.json({ erro: "Escreve alguma coisa antes de mandar." }, { status: 400 });
  }

  const admin = clienteAdmin();
  if (!admin) {
    return NextResponse.json({ erro: "Chat temporariamente indisponível." }, { status: 500 });
  }

  await admin
    .from("mensagens_prontim_web")
    .insert({ profile_id: user.id, autor: "usuario", texto: mensagem });

  const segredo = process.env.PUSH_API_SECRET;
  if (!segredo) {
    return NextResponse.json({ erro: "Chat temporariamente indisponível." }, { status: 500 });
  }

  let resposta = "Não consegui responder agora. Tenta de novo em instantes.";
  try {
    const respostaN8n = await fetch(URL_WEBHOOK_N8N, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-push-secret": segredo },
      body: JSON.stringify({ profileId: user.id, mensagem }),
    });

    if (respostaN8n.ok) {
      const dados = await respostaN8n.json();
      if (typeof dados.resposta === "string" && dados.resposta.trim()) {
        resposta = dados.resposta.trim();
      }
    }
  } catch {
    // mantém a mensagem de fallback
  }

  await admin
    .from("mensagens_prontim_web")
    .insert({ profile_id: user.id, autor: "prontim", texto: resposta });

  return NextResponse.json({ resposta });
}
