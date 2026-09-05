// Escada de preços do Quintalzim (docs/quintalzim-contexto-projeto.md, seção
// 2). Fonte única de verdade pra valor + categoria de cada plano — usado nas
// rotas /api/asaas/* e nos painéis de assinatura do portal.

export type CategoriaPlano = "pf" | "empresa" | "profissional";

export type Plano = {
  id: string;
  nome: string;
  valor: number;
  categoria: CategoriaPlano;
  descricao: string;
};

export const PLANOS: Record<string, Plano> = {
  pf_base: {
    id: "pf_base",
    nome: "PF Base",
    valor: 19,
    categoria: "pf",
    descricao: "Volume, porta de entrada.",
  },
  pf_premium: {
    id: "pf_premium",
    nome: "PF Premium",
    valor: 49,
    categoria: "pf",
    descricao: "Acompanhamento ativo via WhatsApp.",
  },
  empresa_start: {
    id: "empresa_start",
    nome: "Empresa Start",
    valor: 79,
    categoria: "empresa",
    descricao: "Vitrine + agendamento + catálogo básico.",
  },
  empresa_pro: {
    id: "empresa_pro",
    nome: "Empresa Pro",
    valor: 149,
    categoria: "empresa",
    descricao: "+ Recepcionista IA + posts diários.",
  },
  empresa_completo: {
    id: "empresa_completo",
    nome: "Empresa Completo",
    valor: 199,
    categoria: "empresa",
    descricao: "+ vendas, despesas, DRE, clube de assinaturas.",
  },
  profissional: {
    id: "profissional",
    nome: "Profissional",
    valor: 29,
    categoria: "profissional",
    descricao: "Perfil no marketplace + recomendação da IA.",
  },
};

export function planosPorCategoria(categoria: CategoriaPlano): Plano[] {
  return Object.values(PLANOS).filter((p) => p.categoria === categoria);
}

export function buscarPlano(id: string): Plano | null {
  return PLANOS[id] ?? null;
}
