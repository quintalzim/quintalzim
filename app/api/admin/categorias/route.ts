import { NextRequest, NextResponse } from "next/server";
import { ehSuperadmin } from "@/lib/admin/auth";
import { atualizarCategoria, criarCategoria } from "@/lib/categorias-servico";
import { clienteAdmin } from "@/lib/push-servidor";
import { createClient } from "@/lib/supabase/server";

// Primeira rota de escrita do admin (docs/quintalzim-contexto-projeto.md,
// seção Marketplace v1.21) — até aqui /app/admin era só leitura. Padrão:
// checa sessão + ehSuperadmin() com o client normal (cookies), e só então
// usa clienteAdmin() (service role) pra escrever, porque categorias_servico
// não tem policy de INSERT/UPDATE pra authenticated (ver docs/sql/categorias-servico.sql).
async function exigirSuperadmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false as const, status: 401, erro: "Não autenticado." };

  const { data: perfil } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!ehSuperadmin(perfil?.role)) return { ok: false as const, status: 403, erro: "Não autorizado." };

  const admin = clienteAdmin();
  if (!admin) return { ok: false as const, status: 500, erro: "Indisponível." };

  return { ok: true as const, admin };
}

export async function POST(request: NextRequest) {
  const checagem = await exigirSuperadmin();
  if (!checagem.ok) return NextResponse.json({ erro: checagem.erro }, { status: checagem.status });

  const corpo = await request.json().catch(() => null);
  if (!corpo?.nome?.trim()) {
    return NextResponse.json({ erro: "Nome é obrigatório." }, { status: 400 });
  }

  const { categoria, erro } = await criarCategoria(checagem.admin, {
    nome: corpo.nome,
    descricao: corpo.descricao ?? null,
    emoji: corpo.emoji ?? null,
    ordem: typeof corpo.ordem === "number" ? corpo.ordem : undefined,
  });

  if (erro) return NextResponse.json({ erro }, { status: 400 });
  return NextResponse.json({ categoria });
}

export async function PATCH(request: NextRequest) {
  const checagem = await exigirSuperadmin();
  if (!checagem.ok) return NextResponse.json({ erro: checagem.erro }, { status: checagem.status });

  const corpo = await request.json().catch(() => null);
  if (!corpo?.id) {
    return NextResponse.json({ erro: "id é obrigatório." }, { status: 400 });
  }

  const { ok, erro } = await atualizarCategoria(checagem.admin, corpo.id, {
    nome: corpo.nome,
    descricao: corpo.descricao,
    emoji: corpo.emoji,
    ativo: corpo.ativo,
    ordem: corpo.ordem,
  });

  if (!ok) return NextResponse.json({ erro }, { status: 400 });
  return NextResponse.json({ ok: true });
}
