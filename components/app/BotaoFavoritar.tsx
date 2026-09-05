"use client";

import { useState } from "react";
import type { AppId } from "@/lib/apps-catalogo";
import { createClient } from "@/lib/supabase/client";

// Estrela pra marcar/desmarcar um mini-app como favorito (Catálogo). Lê e
// grava direto em profiles.apps_favoritos (array de AppId) — sem rota de
// API própria, mesmo padrão client-side simples já usado em outros
// formulários pequenos do portal (ex: FormularioEditarTelefone).
export default function BotaoFavoritar({
  appId,
  favoritoInicial,
}: {
  appId: AppId;
  favoritoInicial: boolean;
}) {
  const supabase = createClient();
  const [favorito, setFavorito] = useState(favoritoInicial);
  const [carregando, setCarregando] = useState(false);

  async function alternar() {
    if (carregando) return;
    setCarregando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setCarregando(false);
      return;
    }

    const { data: perfil } = await supabase
      .from("profiles")
      .select("apps_favoritos")
      .eq("id", user.id)
      .maybeSingle();

    const atuais: string[] = perfil?.apps_favoritos ?? [];
    const proximoFavorito = !favorito;
    const novos = proximoFavorito
      ? [...atuais.filter((a) => a !== appId), appId]
      : atuais.filter((a) => a !== appId);

    const { error } = await supabase
      .from("profiles")
      .update({ apps_favoritos: novos })
      .eq("id", user.id);

    if (!error) {
      setFavorito(proximoFavorito);
    }
    setCarregando(false);
  }

  return (
    <button
      type="button"
      onClick={alternar}
      disabled={carregando}
      aria-label={favorito ? "Remover dos favoritos" : "Marcar como favorito"}
      aria-pressed={favorito}
      className="text-lg leading-none text-amarelo disabled:opacity-40"
    >
      {favorito ? "⭐" : "☆"}
    </button>
  );
}
