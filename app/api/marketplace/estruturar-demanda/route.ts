import { NextRequest, NextResponse } from "next/server";
import { listarCategoriasAtivas } from "@/lib/categorias-servico";
import { createClient } from "@/lib/supabase/server";

const URL_WEBHOOK_N8N = "https://n8n.quintalzim.com.br/webhook/estruturar-demanda";

function normalizarParaSlug(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

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

  // Categorias de Serviço (v1.21) — a IA não inventa mais categoria livre:
  // recebe o catálogo cadastrado (docs/sql/categorias-servico.sql) e escolhe
  // um slug de dentro dele (ou nenhum, se não bater com nada).
  const supabase = await createClient();
  const categorias = await listarCategoriasAtivas(supabase);
  const categoriasParaIA = categorias.map((c) => ({ slug: c.slug, nome: c.nome }));

  function resolverCategoriaId(slugOuTexto: string | null | undefined): string | null {
    if (!slugOuTexto) return null;
    const alvo = normalizarParaSlug(slugOuTexto);
    return categorias.find((c) => c.slug === alvo)?.id ?? null;
  }

  try {
    const respostaN8n = await fetch(URL_WEBHOOK_N8N, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-push-secret": segredo },
      body: JSON.stringify({ ...corpo, categorias: categoriasParaIA }),
    });

    if (!respostaN8n.ok) {
      return NextResponse.json({
        categoriaId: resolverCategoriaId(corpo.categoria),
        local: corpo.local ?? null,
        prazo: corpo.prazo ?? null,
        valor: corpo.valor ?? null,
      });
    }

    const dados = await respostaN8n.json();
    return NextResponse.json({
      categoriaId: resolverCategoriaId(dados.categoriaSlug) ?? resolverCategoriaId(corpo.categoria),
      local: dados.local ?? corpo.local ?? null,
      prazo: dados.prazo ?? corpo.prazo ?? null,
      valor: typeof dados.valor === "number" ? dados.valor : corpo.valor ?? null,
    });
  } catch {
    // Se a IA falhar, publica com o que a pessoa já preencheu — não trava o
    // fluxo. Tenta casar o texto livre digitado com uma categoria cadastrada
    // antes de desistir e deixar sem categoria.
    return NextResponse.json({
      categoriaId: resolverCategoriaId(corpo.categoria),
      local: corpo.local ?? null,
      prazo: corpo.prazo ?? null,
      valor: corpo.valor ?? null,
    });
  }
}
