"use client";

import { useEffect } from "react";
import { CHAVE_CADASTRO_PENDENTE, type CadastroPendente } from "@/lib/empresa-clientes";
import { createClient } from "@/lib/supabase/client";

// Componente invisível: roda uma vez por carregamento de página autenticada.
// Se existir um cadastro de cliente-final pendente (salvo antes do magic link
// em /b/[slug]), finaliza o vínculo com a empresa e limpa o localStorage.
export default function FinalizarCadastroClienteEmpresa() {
  useEffect(() => {
    let cancelado = false;

    async function finalizar() {
      let bruto: string | null = null;
      try {
        bruto = window.localStorage.getItem(CHAVE_CADASTRO_PENDENTE);
      } catch {
        return;
      }
      if (!bruto) return;

      let pendente: CadastroPendente;
      try {
        pendente = JSON.parse(bruto);
      } catch {
        window.localStorage.removeItem(CHAVE_CADASTRO_PENDENTE);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelado) return;

      await supabase.from("empresa_clientes").upsert(
        {
          empresa_id: pendente.empresaId,
          profile_id: user.id,
          nome: pendente.nome,
          telefone: pendente.telefone,
        },
        { onConflict: "empresa_id,profile_id" }
      );

      // Também deixa o telefone disponível pro Prontim, se ainda não tiver um
      const { data: perfil } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle();

      if (!perfil?.phone) {
        await supabase
          .from("profiles")
          .upsert({ id: user.id, phone: pendente.telefone }, { onConflict: "id" });
      }

      window.localStorage.removeItem(CHAVE_CADASTRO_PENDENTE);
    }

    finalizar();

    return () => {
      cancelado = true;
    };
  }, []);

  return null;
}
