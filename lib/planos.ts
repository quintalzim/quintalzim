// Escada de preços do Quintalzim (docs/quintalzim-contexto-projeto.md, seção
// 2). Fonte única de verdade pra valor + categoria de cada plano — usado nas
// rotas /api/asaas/* e nos painéis de assinatura do portal.
//
// Categoria 'profissional' removida (05/set) por decisão do usuário: virar
// Profissional no Marketplace deixou de ter assinatura própria e passou a
// ser um benefício do PF Premium (ver app/app/marketplace/page.tsx). Linhas
// antigas em `assinaturas` com categoria='profissional' ficam órfãs no banco
// (nenhuma tela do portal lê mais essa categoria) — inofensivo, não precisou
// de migração de limpeza.

export type CategoriaPlano = "pf" | "empresa";

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
    valor: 39,
    categoria: "pf",
    descricao: "Acompanhamento ativo via WhatsApp e perfil no Marketplace de profissionais.",
  },
  empresa_start: {
    id: "empresa_start",
    nome: "Empresa Start",
    valor: 49,
    categoria: "empresa",
    descricao: "Vitrine + agendamento + catálogo básico.",
  },
  empresa_pro: {
    id: "empresa_pro",
    nome: "Empresa Pro",
    valor: 79,
    categoria: "empresa",
    descricao: "+ Recepcionista IA + posts diários.",
  },
  empresa_completo: {
    id: "empresa_completo",
    nome: "Empresa Completo",
    valor: 99,
    categoria: "empresa",
    descricao: "+ vendas, despesas, DRE, clube de assinaturas.",
  },
};

export function planosPorCategoria(categoria: CategoriaPlano): Plano[] {
  return Object.values(PLANOS).filter((p) => p.categoria === categoria);
}

export function buscarPlano(id: string): Plano | null {
  return PLANOS[id] ?? null;
}
