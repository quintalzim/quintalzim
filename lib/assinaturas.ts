import type { SupabaseClient } from "@supabase/supabase-js";
import { ehSuperadmin } from "@/lib/admin/auth";

// Nível de acesso PF, derivado da tabela `assinaturas` (categoria='pf').
// Escada de planos (lib/planos.ts): PF Base = porta de entrada, uso pelo
// portal (web). PF Premium = "acompanhamento ativo via WhatsApp" — soma o
// canal WhatsApp do Prontim (despesas por texto/áudio, tarefas/compras por
// zap, calorias por foto) ao que o Base já dá.
export type NivelPF = "nenhum" | "base" | "premium";

const ORDEM_NIVEL: NivelPF[] = ["nenhum", "base", "premium"];

export function nivelAtende(nivel: NivelPF, minimo: NivelPF): boolean {
  return ORDEM_NIVEL.indexOf(nivel) >= ORDEM_NIVEL.indexOf(minimo);
}

// Nome de exibição do plano MÍNIMO exigido (usado pelo TelaBloqueada pra
// dizer "Recurso do plano X"). Corrige um bug encontrado nesta revisão: o
// mapeamento antigo (embutido no próprio componente) mostrava "PF Premium"
// mesmo quando o recurso bloqueado exigia só o Base (ex: Tarefas & Compras,
// Prontim web, Marketplace).
const NOME_NIVEL_PF: Record<NivelPF, string> = {
  nenhum: "PF Base",
  base: "PF Base",
  premium: "PF Premium",
};

export function nomeNivelPF(minimo: NivelPF): string {
  return NOME_NIVEL_PF[minimo];
}

// Superadmin (profiles.role='admin') sempre tem acesso completo — mesma
// regra já usada pra liberar /app/admin, aplicada aqui pra não ficar preso
// atrás do próprio paywall que ele mantém.
export async function nivelPF(
  supabase: SupabaseClient,
  userId: string,
  roleJaCarregado?: string | null
): Promise<NivelPF> {
  const role =
    roleJaCarregado !== undefined
      ? roleJaCarregado
      : (
          await supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
        ).data?.role;

  if (ehSuperadmin(role)) return "premium";

  const { data } = await supabase
    .from("assinaturas")
    .select("plano, status")
    .eq("profile_id", userId)
    .eq("categoria", "pf")
    .maybeSingle();

  if (!data || data.status !== "ativa") return "nenhum";
  return data.plano === "pf_premium" ? "premium" : "base";
}

// Nível de acesso Empresa, derivado da tabela `assinaturas` (categoria='empresa').
// Escada de planos (lib/planos.ts) — mapeamento de feature por tier confirmado
// com o usuário (05/set): Start = Vitrine + Catálogo & Loja; Pro = + Agendamentos
// (Recepcionista IA) + Posts automáticos/Briefing empresarial; Completo = +
// Gestão/DRE + Clube de Assinaturas.
export type NivelEmpresa = "nenhum" | "start" | "pro" | "completo";

const ORDEM_NIVEL_EMPRESA: NivelEmpresa[] = ["nenhum", "start", "pro", "completo"];

export function nivelEmpresaAtende(nivel: NivelEmpresa, minimo: NivelEmpresa): boolean {
  return ORDEM_NIVEL_EMPRESA.indexOf(nivel) >= ORDEM_NIVEL_EMPRESA.indexOf(minimo);
}

const NOME_NIVEL_EMPRESA: Record<NivelEmpresa, string> = {
  nenhum: "Empresa Start",
  start: "Empresa Start",
  pro: "Empresa Pro",
  completo: "Empresa Completo",
};

export function nomeNivelEmpresa(nivel: NivelEmpresa): string {
  return NOME_NIVEL_EMPRESA[nivel];
}

// Superadmin sempre tem acesso completo, mesma regra do nivelPF.
export async function nivelEmpresa(
  supabase: SupabaseClient,
  userId: string,
  roleJaCarregado?: string | null
): Promise<NivelEmpresa> {
  const role =
    roleJaCarregado !== undefined
      ? roleJaCarregado
      : (
          await supabase.from("profiles").select("role").eq("id", userId).maybeSingle()
        ).data?.role;

  if (ehSuperadmin(role)) return "completo";

  const { data } = await supabase
    .from("assinaturas")
    .select("plano, status")
    .eq("profile_id", userId)
    .eq("categoria", "empresa")
    .maybeSingle();

  if (!data || data.status !== "ativa") return "nenhum";
  if (data.plano === "empresa_completo") return "completo";
  if (data.plano === "empresa_pro") return "pro";
  return "start";
}
