import { NextRequest, NextResponse } from "next/server";

const URL_WEBHOOK_N8N = "https://n8n.quintalzim.com.br/webhook/conversor-extrato";

type Transacao = { data: string; descricao: string; valor: number; tipo: string };

export async function POST(request: NextRequest) {
  let corpo: { imagemBase64?: string; mediaType?: string };

  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const { imagemBase64, mediaType } = corpo;

  if (!imagemBase64?.trim()) {
    return NextResponse.json({ erro: "Manda uma foto ou print do extrato." }, { status: 400 });
  }

  const segredo = process.env.PUSH_API_SECRET;
  if (!segredo) {
    return NextResponse.json({ erro: "Ferramenta temporariamente indisponível." }, { status: 500 });
  }

  try {
    const respostaN8n = await fetch(URL_WEBHOOK_N8N, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-push-secret": segredo },
      body: JSON.stringify({ imagemBase64, mediaType: mediaType || "image/jpeg" }),
    });

    if (!respostaN8n.ok) {
      return NextResponse.json({ erro: "Não consegui ler o extrato agora. Tenta de novo." }, { status: 502 });
    }

    const dados = await respostaN8n.json();
    const transacoes: Transacao[] = Array.isArray(dados.transacoes) ? dados.transacoes : [];
    const erro = typeof dados.erro === "string" ? dados.erro : null;

    if (transacoes.length === 0) {
      return NextResponse.json({ erro: erro || "Não encontrei transações nessa imagem." }, { status: 422 });
    }

    return NextResponse.json({ transacoes });
  } catch {
    return NextResponse.json({ erro: "Não consegui ler o extrato agora. Tenta de novo." }, { status: 502 });
  }
}
