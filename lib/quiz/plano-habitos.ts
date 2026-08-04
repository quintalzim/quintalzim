import type { SupabaseClient } from "@supabase/supabase-js";

export type PlanoHabitos = {
  diagnostico: string;
  plano: string[];
  createdAt: string;
};

// Liga um lead de quiz (capturado antes da pessoa ter conta) ao profile assim
// que ela vira assinante — por e-mail, já que o quiz não exige login. Só roda
// no servidor (precisa da service role pra ignorar RLS). Depois de ligado uma
// vez, o lead nunca mais é reatribuído (evita pegar um quiz refeito por
// engano por outra pessoa com o mesmo e-mail).
export async function buscarPlanoHabitos(
  admin: SupabaseClient,
  userId: string,
  email: string | null | undefined
): Promise<PlanoHabitos | null> {
  if (email) {
    await admin
      .from("quiz_leads")
      .update({ profile_id: userId })
      .eq("email", email)
      .is("profile_id", null);
  }

  const { data } = await admin
    .from("quiz_leads")
    .select("diagnostico, plano_habitos, created_at")
    .eq("profile_id", userId)
    .not("plano_habitos", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data || !Array.isArray(data.plano_habitos) || data.plano_habitos.length === 0) {
    return null;
  }

  return {
    diagnostico: data.diagnostico ?? "",
    plano: data.plano_habitos as string[],
    createdAt: data.created_at,
  };
}
