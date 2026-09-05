import type { SupabaseClient } from "@supabase/supabase-js";

export type DreEmpresa = {
  receita: number;
  despesa: number;
  resultado: number;
  qtdVendas: number;
};

// Mesmo parser flexível usado no Briefing Financeiro: a coluna `date` de
// `transactions` (Quintal de Finanças) vem tanto em DD/MM/AAAA (texto) quanto
// em AAAA-MM-DD, dependendo de como a linha foi criada — cobre os dois.
function parseDataTransacao(str: string | null): Date | null {
  if (!str) return null;
  let m = /^(\d{4})-(\d{2})-(\d{2})/.exec(str);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  m = /^(\d{2})\/(\d{2})\/(\d{4})/.exec(str);
  if (m) return new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return null;
}

// DRE v1 da Empresa: reaproveita o que já existe. Receita = soma do `valor`
// de agendamentos confirmados no mês (preenchido pelo dono ao confirmar, ver
// PainelAgendamentos) + soma de preco_unitario*quantidade dos pedidos do
// Catálogo confirmados no mês (ver PainelPedidosCatalogo). Despesa =
// transações do dono no Quintal de Finanças cuja categoria contém "PJ" —
// heurística v1, já que não existe separação formal entre ledger pessoal e
// da Empresa; validar na prática se faz sentido pra donos que nomeiam
// categoria diferente.
export async function calcularDreMesAtual(
  supabase: SupabaseClient,
  empresaId: string,
  ownerId: string
): Promise<DreEmpresa> {
  const agora = new Date();
  const inicioMes = new Date(agora.getFullYear(), agora.getMonth(), 1);
  const fimMes = new Date(agora.getFullYear(), agora.getMonth() + 1, 1);

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("valor, data_hora_desejada")
    .eq("empresa_id", empresaId)
    .eq("status", "confirmado")
    .not("valor", "is", null)
    .gte("data_hora_desejada", inicioMes.toISOString())
    .lt("data_hora_desejada", fimMes.toISOString());

  const receitaAgendamentos = (agendamentos ?? []).reduce(
    (soma, item) => soma + (Number(item.valor) || 0),
    0
  );

  const { data: pedidosCatalogo } = await supabase
    .from("pedidos_catalogo")
    .select("preco_unitario, quantidade, created_at")
    .eq("empresa_id", empresaId)
    .eq("status", "confirmado")
    .not("preco_unitario", "is", null)
    .gte("created_at", inicioMes.toISOString())
    .lt("created_at", fimMes.toISOString());

  const receitaCatalogo = (pedidosCatalogo ?? []).reduce(
    (soma, item) => soma + (Number(item.preco_unitario) || 0) * (Number(item.quantidade) || 1),
    0
  );

  const receita = receitaAgendamentos + receitaCatalogo;
  const qtdVendas = (agendamentos ?? []).length + (pedidosCatalogo ?? []).length;

  const { data: transacoes } = await supabase
    .from("transactions")
    .select("amount, date, category")
    .eq("user_id", ownerId)
    .ilike("category", "%PJ%");

  const despesa = (transacoes ?? [])
    .filter((transacao) => {
      const data = parseDataTransacao(transacao.date);
      return data !== null && data >= inicioMes && data < fimMes;
    })
    .reduce((soma, transacao) => soma + Math.abs(Number(transacao.amount) || 0), 0);

  return { receita, despesa, resultado: receita - despesa, qtdVendas };
}
