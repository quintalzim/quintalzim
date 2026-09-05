import { NextRequest, NextResponse } from "next/server";

const URL_WEBHOOK_N8N = "https://n8n.quintalzim.com.br/webhook/gerador-bio-legenda";

export async function POST(request: NextRequest) {
  let corpo: { negocio?: string; descricao?: string; tom?: string };

  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const { negocio, descricao, tom } = corpo;

  if (!negocio?.trim() || !descricao?.trim()) {
    return NextResponse.json(
      { erro: "Preenche o nome do negócio e uma descrição do que ele faz." },
      { status: 400 }
    );
  }

  const segredo = process.env.PUSH_API_SECRET;
  if (!segredo) {
    return NextResponse.json({ erro: "Ferramenta temporariamente indisponível." }, { status: 500 });
  }

  try {
    const respostaN8n = await fetch(URL_WEBHOOK_N8N, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-push-secret": segredo },
      body: JSON.stringify({ negocio: negocio.trim(), descricao: descricao.trim(), tom: tom?.trim() || undefined }),
    });

    if (!respostaN8n.ok) {
      return NextResponse.json({ erro: "Não consegui gerar agora. Tenta de novo em instantes." }, { status: 502 });
    }

    const dados = await respostaN8n.json();
    const bio = typeof dados.bio === "string" ? dados.bio : "";
    const legenda = typeof dados.legenda === "string" ? dados.legenda : "";

    if (!bio && !legenda) {
      return NextResponse.json({ erro: "Não consegui gerar agora. Tenta de novo em instantes." }, { status: 502 });
    }

    return NextResponse.json({ bio, legenda });
  } catch {
    return NextResponse.json({ erro: "Não consegui gerar agora. Tenta de novo em instantes." }, { status: 502 });
  }
}
