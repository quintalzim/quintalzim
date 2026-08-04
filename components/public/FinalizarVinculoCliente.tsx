"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Invisível. Roda em /b/[slug] pra quem já está autenticado: garante que
// existe uma linha em profiles (com acesso_portal='restrito' se a conta
// acabou de nascer aqui, nunca rebaixa quem já era assinante) e o vínculo em
// empresa_clientes. Substitui o mecanismo antigo baseado em localStorage —
// agora os dados vêm do user_metadata (sobrevive a trocar de navegador/
// dispositivo entre pedir o link e clicar nele).
export default function FinalizarVinculoCliente({ empresaId }: { empresaId: string }) {
  useEffect(() => {
    let cancelado = false;

    async function finalizar() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelado) return;

      const nome = (user.user_metadata?.name as string | undefined)?.trim() || "";
      const telefone = (user.user_metadata?.phone as string | undefined) || null;

      const { data: perfilExistente } = await supabase
        .from("profiles")
        .select("id, phone")
        .eq("id", user.id)
        .maybeSingle();

      if (!perfilExistente) {
        await supabase
          .from("profiles")
          .insert({ id: user.id, phone: telefone, acesso_portal: "restrito" });
      } else if (!perfilExistente.phone && telefone) {
        await supabase.from("profiles").update({ phone: telefone }).eq("id", user.id);
      }

      await supabase.from("empresa_clientes").upsert(
        { empresa_id: empresaId, profile_id: user.id, nome, telefone },
        { onConflict: "empresa_id,profile_id" }
      );
    }

    finalizar();

    return () => {
      cancelado = true;
    };
  }, [empresaId]);

  return null;
}
