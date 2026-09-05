import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

const URL_WEBHOOK_N8N = "https://n8n.quintalzim.com.br/webhook/extrair-tarefas";

type ItemExtraido = {
  tipo: "tarefa" | "compra";
  texto: string;
  quantidade: string | null;
  prazo: string | null;
};

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autorizado" }, { status: 401 });
  }

  let corpo: { texto?: string };
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const texto = corpo.texto?.trim();
  if (!texto) {
    return NextResponse.json({ erro: "Escreve ou fala alguma coisa antes." }, { status: 400 });
  }

  const segredo = process.env.PUSH_API_SECRET;
  if (!segredo) {
    return NextResponse.json({ erro: "Não consegui organizar agora." }, { status: 500 });
  }

  let itensExtraidos: ItemExtraido[] = [];
  try {
    const respostaN8n = await fetch(URL_WEBHOOK_N8N, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-push-secret": segredo },
      body: JSON.stringify({ texto }),
    });

    if (respostaN8n.ok) {
      const dados = await respostaN8n.json();
      if (Array.isArray(dados.itens)) {
        itensExtraidos = dados.itens;
      }
    }
  } catch {
    // itensExtraidos fica vazio, tratado abaixo
  }

  if (itensExtraidos.length === 0) {
    return NextResponse.json({ itens: [] });
  }

  const paraInserir = itensExtraidos.map((item) => ({
    profile_id: user.id,
    tipo: item.tipo,
    texto: item.texto,
    quantidade: item.quantidade,
    prazo: item.prazo,
    origem: "ia",
  }));

  const { data, error } = await supabase
    .from("itens_lista")
    .insert(paraInserir)
    .select("id, tipo, texto, quantidade, concluido, prazo, prioridade, origem");

  if (error) {
    return NextResponse.json({ erro: "Não consegui salvar os itens." }, { status: 500 });
  }

  return NextResponse.json({ itens: data ?? [] });
}
