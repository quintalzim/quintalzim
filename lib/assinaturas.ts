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
