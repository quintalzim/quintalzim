import type { NivelPF } from "@/lib/assinaturas";

// Catálogo de mini-apps favoritáveis, usado tanto pro toggle de favoritos
// em /app/catalogo quanto pros atalhos reais em /app/inicio (05/set/2026).
// Só inclui apps com uma página de destino de verdade pra abrir — Calorias
// por Foto (só WhatsApp) fica de fora por não ter pra onde levar o clique.
// Quintal de Finanças aponta pro Catálogo (não pro próprio app externo)
// porque o botão "Abrir" de lá depende de um handshake de SSO client-side
// (token de sessão), que não dá pra replicar num link simples aqui.
export type AppId = "financas" | "tarefas" | "prontim" | "marketplace" | "balcao-demandas" | "ferramentas";

export type DefinicaoApp = {
  id: AppId;
  nome: string;
  icone: string;
  href: string;
  // Nível PF mínimo pra usar de fato. Undefined = sempre liberado (não
  // depende de assinatura PF).
  minimoPF?: NivelPF;
};

export const APPS_CATALOGO: DefinicaoApp[] = [
  { id: "financas", nome: "Quintal de Finanças", icone: "🌱", href: "/app/catalogo", minimoPF: "base" },
  { id: "tarefas", nome: "Tarefas & Compras", icone: "📝", href: "/app/tarefas", minimoPF: "base" },
  { id: "prontim", nome: "Chat com o Prontim", icone: "💬", href: "/app/prontim", minimoPF: "base" },
  { id: "marketplace", nome: "Marketplace", icone: "🤝", href: "/marketplace", minimoPF: "base" },
  {
    id: "balcao-demandas",
    nome: "Balcão de Demandas",
    icone: "📋",
    href: "/marketplace/demandas",
    minimoPF: "base",
  },
  { id: "ferramentas", nome: "Ferramentas", icone: "🧮", href: "/ferramentas" },
];

export function buscarAppCatalogo(id: string): DefinicaoApp | undefined {
  return APPS_CATALOGO.find((a) => a.id === id);
}
