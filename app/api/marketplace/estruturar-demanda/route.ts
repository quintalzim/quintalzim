import { NextRequest, NextResponse } from "next/server";

const URL_WEBHOOK_N8N = "https://n8n.quintalzim.com.br/webhook/estruturar-demanda";

export async function POST(request: NextRequest) {
  let corpo: {
    descricao?: string;
    categoria?: string;
    local?: string;
    prazo?: string;
    valor?: number;
  };

  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  if (!corpo.descricao?.trim()) {
    return NextResponse.json({ erro: "Conta o que você precisa." }, { status: 400 });
  }

  const segredo = process.env.PUSH_API_SECRET;
  if (!segredo) {
    return NextResponse.json({ erro: "Ferramenta temporariamente indisponível." }, { status: 500 });
  }

  try {
    const respostaN8n = await fetch(URL_WEBHOOK_N8N, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-push-secret": segredo },
      body: JSON.stringify(corpo),
    });

    if (!respostaN8n.ok) {
      return NextResponse.json(
        { categoria: corpo.categoria ?? null, local: corpo.local ?? null, prazo: corpo.prazo ?? null, valor: corpo.valor ?? null }
      );
    }

    const dados = await respostaN8n.json();
    return NextResponse.json({
      categoria: dados.categoria ?? corpo.categoria ?? null,
      local: dados.local ?? corpo.local ?? null,
      prazo: dados.prazo ?? corpo.prazo ?? null,
      valor: typeof dados.valor === "number" ? dados.valor : corpo.valor ?? null,
    });
  } catch {
    // Se a IA falhar, publica com o que a pessoa já preencheu — não trava o fluxo.
    return NextResponse.json({
      categoria: corpo.categoria ?? null,
      local: corpo.local ?? null,
      prazo: corpo.prazo ?? null,
      valor: corpo.valor ?? null,
    });
  }
}
