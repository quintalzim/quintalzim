import type { SupabaseClient } from "@supabase/supabase-js";

// Categorias de Serviço do Marketplace (docs/sql/categorias-servico.sql, v1.21).
// Generaliza o Marketplace, que até aqui só existia pra "Personal Trainer"
// hardcoded no código, pra um catálogo administrável em /app/admin — pintor,
// pedreiro, faxineira, etc, sem precisar criar página nem tocar em código
// a cada novo tipo de serviço.
//
// Leitura é RLS-pública (qualquer cliente pode buscar, ver
// docs/sql/categorias-servico.sql), então as funções de listagem aceitam
// tanto o client normal (`lib/supabase/server` / `lib/supabase/client`)
// quanto o `clienteAdmin()`. Escrita (criar/editar) exige service role —
// só faz sentido chamar com `clienteAdmin()`, atrás de `ehSuperadmin()`.

export type CategoriaServico = {
  id: string;
  slug: string;
  nome: string;
  descricao: string | null;
  emoji: string | null;
  ativo: boolean;
  ordem: number;
};

const COLUNAS = "id, slug, nome, descricao, emoji, ativo, ordem";

export async function listarCategoriasAtivas(
  supabase: SupabaseClient
): Promise<CategoriaServico[]> {
  const { data } = await supabase
    .from("categorias_servico")
    .select(COLUNAS)
    .eq("ativo", true)
    .order("ordem", { ascending: true });
  return data ?? [];
}

// Usado só no admin — traz também as inativas, pra poder reativar.
export async function listarTodasCategorias(admin: SupabaseClient): Promise<CategoriaServico[]> {
  const { data } = await admin
    .from("categorias_servico")
    .select(COLUNAS)
    .order("ordem", { ascending: true });
  return data ?? [];
}

export async function buscarCategoriaPorSlug(
  supabase: SupabaseClient,
  slug: string
): Promise<CategoriaServico | null> {
  const { data } = await supabase
    .from("categorias_servico")
    .select(COLUNAS)
    .eq("slug", slug)
    .maybeSingle();
  return data ?? null;
}

function normalizarSlug(valor: string): string {
  return valor
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove acento
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function criarCategoria(
  admin: SupabaseClient,
  dados: { nome: string; descricao?: string | null; emoji?: string | null; ordem?: number }
): Promise<{ categoria: CategoriaServico | null; erro: string | null }> {
  const nome = dados.nome.trim();
  if (!nome) return { categoria: null, erro: "Nome é obrigatório." };

  const slug = normalizarSlug(nome);
  if (!slug) return { categoria: null, erro: "Não consegui gerar um slug a partir desse nome." };

  const { data, error } = await admin
    .from("categorias_servico")
    .insert({
      slug,
      nome,
      descricao: dados.descricao?.trim() || null,
      emoji: dados.emoji?.trim() || null,
      ordem: dados.ordem ?? 0,
    })
    .select(COLUNAS)
    .single();

  if (error) {
    return {
      categoria: null,
      erro: error.code === "23505" ? "Já existe uma categoria com esse nome/slug." : "Não consegui salvar.",
    };
  }

  return { categoria: data, erro: null };
}

export async function atualizarCategoria(
  admin: SupabaseClient,
  id: string,
  dados: { nome?: string; descricao?: string | null; emoji?: string | null; ativo?: boolean; ordem?: number }
): Promise<{ ok: boolean; erro: string | null }> {
  const patch: Record<string, unknown> = {};
  if (dados.nome !== undefined) patch.nome = dados.nome.trim();
  if (dados.descricao !== undefined) patch.descricao = dados.descricao?.trim() || null;
  if (dados.emoji !== undefined) patch.emoji = dados.emoji?.trim() || null;
  if (dados.ativo !== undefined) patch.ativo = dados.ativo;
  if (dados.ordem !== undefined) patch.ordem = dados.ordem;

  const { error } = await admin.from("categorias_servico").update(patch).eq("id", id);
  if (error) return { ok: false, erro: "Não consegui salvar." };
  return { ok: true, erro: null };
}
