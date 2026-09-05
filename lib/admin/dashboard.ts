import type { SupabaseClient } from "@supabase/supabase-js";

// Painel de controle geral do fundador — substitui o PostHog que ele decidiu
// não usar. Agrega contagens de todas as tabelas do projeto via clienteAdmin()
// (service role, ignora RLS de propósito: aqui é uma visão cross-usuário).
// Mantido num único arquivo/função pra não espalhar 15 queries pela página.

export type DadosAdmin = {
  contas: {
    totalUsuarios: number;
    assinantesCompletos: number;
    clientesRestritos: number;
  };
  empresas: {
    total: number;
    lista: { id: string; nome: string; slug: string | null; createdAt: string }[];
  };
  leads: {
    total: number;
    convertidos: number;
    porFunil: { funil: string; quantidade: number }[];
    recentes: {
      nome: string;
      email: string;
      quiz: string;
      convertido: boolean;
      createdAt: string;
    }[];
  };
  marketplace: {
    totalProfissionais: number;
    verificados: number;
    porCategoria: { categoria: string; quantidade: number }[];
    demandasPorStatus: { status: string; quantidade: number }[];
    totalInteresses: number;
    ranking: { nome: string; quantidade: number }[];
  };
  atividadeComercial: {
    agendamentosConfirmados: number;
    receitaAgendamentos: number;
    pedidosCatalogoConfirmados: number;
    receitaCatalogo: number;
  };
};

export async function buscarDadosAdmin(admin: SupabaseClient): Promise<DadosAdmin> {
  const [
    { count: totalUsuarios },
    { count: assinantesCompletos },
    { count: clientesRestritos },
    { data: empresas },
    { count: totalLeads },
    { data: leadsRecentes },
    { data: profissionais },
    { data: demandas },
    { data: interesses },
    { data: agendamentosConfirmados },
    { data: pedidosCatalogoConfirmados },
  ] = await Promise.all([
    admin.from("profiles").select("id", { count: "exact", head: true }),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("acesso_portal", "completo"),
    admin
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("acesso_portal", "restrito"),
    admin.from("empresas").select("id, nome, slug, created_at").order("created_at", { ascending: false }),
    admin.from("quiz_leads").select("id", { count: "exact", head: true }),
    admin
      .from("quiz_leads")
      .select("nome, email, quiz, profile_id, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    admin
      .from("profissionais_marketplace")
      .select("categoria, verificado"),
    admin.from("demandas_marketplace").select("status"),
    admin.from("interesses_demanda").select("profissional_profile_id, nome_interessado"),
    admin
      .from("agendamentos")
      .select("valor")
      .eq("status", "confirmado")
      .not("valor", "is", null),
    admin
      .from("pedidos_catalogo")
      .select("preco_unitario, quantidade")
      .eq("status", "confirmado")
      .not("preco_unitario", "is", null),
  ]);

  // Leads: agrupamento por funil (campo `quiz`) e todos pra contar convertidos
  const { data: todosLeads } = await admin.from("quiz_leads").select("quiz, profile_id");
  const convertidos = (todosLeads ?? []).filter((l) => l.profile_id !== null).length;
  const porFunilMapa = new Map<string, number>();
  for (const lead of todosLeads ?? []) {
    porFunilMapa.set(lead.quiz, (porFunilMapa.get(lead.quiz) ?? 0) + 1);
  }

  // Marketplace: profissionais por categoria
  const porCategoriaMapa = new Map<string, number>();
  let verificados = 0;
  for (const p of profissionais ?? []) {
    porCategoriaMapa.set(p.categoria, (porCategoriaMapa.get(p.categoria) ?? 0) + 1);
    if (p.verificado) verificados += 1;
  }

  // Demandas por status
  const demandasPorStatusMapa = new Map<string, number>();
  for (const d of demandas ?? []) {
    demandasPorStatusMapa.set(d.status, (demandasPorStatusMapa.get(d.status) ?? 0) + 1);
  }

  // Ranking de quem mais ofereceu (manifestou interesse)
  const rankingMapa = new Map<string, { nome: string; quantidade: number }>();
  for (const i of interesses ?? []) {
    const chave = i.profissional_profile_id;
    const atual = rankingMapa.get(chave);
    if (atual) {
      atual.quantidade += 1;
    } else {
      rankingMapa.set(chave, { nome: i.nome_interessado || "Sem nome", quantidade: 1 });
    }
  }
  const ranking = Array.from(rankingMapa.values())
    .sort((a, b) => b.quantidade - a.quantidade)
    .slice(0, 10);

  const receitaAgendamentos = (agendamentosConfirmados ?? []).reduce(
    (soma, item) => soma + (Number(item.valor) || 0),
    0
  );
  const receitaCatalogo = (pedidosCatalogoConfirmados ?? []).reduce(
    (soma, item) => soma + (Number(item.preco_unitario) || 0) * (Number(item.quantidade) || 1),
    0
  );

  return {
    contas: {
      totalUsuarios: totalUsuarios ?? 0,
      assinantesCompletos: assinantesCompletos ?? 0,
      clientesRestritos: clientesRestritos ?? 0,
    },
    empresas: {
      total: empresas?.length ?? 0,
      lista: (empresas ?? []).map((e) => ({
        id: e.id,
        nome: e.nome,
        slug: e.slug,
        createdAt: e.created_at,
      })),
    },
    leads: {
      total: totalLeads ?? 0,
      convertidos,
      porFunil: Array.from(porFunilMapa.entries()).map(([funil, quantidade]) => ({
        funil,
        quantidade,
      })),
      recentes: (leadsRecentes ?? []).map((l) => ({
        nome: l.nome,
        email: l.email,
        quiz: l.quiz,
        convertido: l.profile_id !== null,
        createdAt: l.created_at,
      })),
    },
    marketplace: {
      totalProfissionais: profissionais?.length ?? 0,
      verificados,
      porCategoria: Array.from(porCategoriaMapa.entries()).map(([categoria, quantidade]) => ({
        categoria,
        quantidade,
      })),
      demandasPorStatus: Array.from(demandasPorStatusMapa.entries()).map(([status, quantidade]) => ({
        status,
        quantidade,
      })),
      totalInteresses: interesses?.length ?? 0,
      ranking,
    },
    atividadeComercial: {
      agendamentosConfirmados: agendamentosConfirmados?.length ?? 0,
      receitaAgendamentos,
      pedidosCatalogoConfirmados: pedidosCatalogoConfirmados?.length ?? 0,
      receitaCatalogo,
    },
  };
}
