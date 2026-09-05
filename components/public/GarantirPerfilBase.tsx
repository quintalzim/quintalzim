"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Invisível. Roda logo após um login via link mágico originado de captura de
// lead (quiz, etc.) pra garantir que existe uma linha em profiles — sem isso
// algumas telas do app (perfil, planos) ficam sem dado nenhum pra mostrar.
// Nunca sobrescreve um profile que já existe. acesso_portal fica no default
// 'completo' (diferente do fluxo de cliente final via /b/slug, que é 'restrito').
export default function GarantirPerfilBase() {
  useEffect(() => {
    let cancelado = false;

    async function garantir() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelado) return;

      const telefone = (user.user_metadata?.phone as string | undefined) || null;

      const { data: perfilExistente } = await supabase
        .from("profiles")
        .select("id, phone")
        .eq("id", user.id)
        .maybeSingle();

      if (!perfilExistente) {
        await supabase.from("profiles").insert({ id: user.id, phone: telefone });
      } else if (!perfilExistente.phone && telefone) {
        await supabase.from("profiles").update({ phone: telefone }).eq("id", user.id);
      }
    }

    garantir();

    return () => {
      cancelado = true;
    };
  }, []);

  return null;
}
