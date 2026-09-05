"use client";

import { useState } from "react";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

type Demanda = {
  id: string;
  autor_profile_id: string;
  categoria: string | null;
  descricao: string;
  local: string | null;
  prazo: string | null;
  valor_oferecido: number | null;
};

function formatarReais(valor: number | null): string {
  if (valor === null) return "";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function ListaDemandas({
  demandas,
  usuarioLogado,
  demandasComInteresse,
}: {
  demandas: Demanda[];
  usuarioLogado: boolean;
  demandasComInteresse: string[];
}) {
  const supabase = createClient();
  const [interessadas, setInteressadas] = useState(new Set(demandasComInteresse));
  const [processando, setProcessando] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  async function manifestarInteresse(demanda: Demanda) {
    setErro(null);
    setProcessando(demanda.id);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setErro("Sessão expirada. Recarrega a página e tenta de novo.");
      setProcessando(null);
      return;
    }

    const { data: perfil } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .maybeSingle();

    const nomeInteressado = (user.user_metadata?.name as string | undefined)?.trim() || "";

    const { error } = await supabase.from("interesses_demanda").insert({
      demanda_id: demanda.id,
      profissional_profile_id: user.id,
      nome_interessado: nomeInteressado,
      contato_interessado: perfil?.phone ?? null,
    });

    if (error) {
      setErro("Não consegui registrar teu interesse. Tenta de novo.");
      setProcessando(null);
      return;
    }

    fetch("/api/push/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: demanda.autor_profile_id,
        demandaId: demanda.id,
        titulo: "Alguém se interessou na tua demanda",
        corpo: `${nomeInteressado || "Alguém"} quer atender: ${demanda.descricao.slice(0, 60)}`,
        url: "/app/marketplace",
      }),
    }).catch(() => {});

    setInteressadas((atual) => new Set(atual).add(demanda.id));
    setProcessando(null);
  }

  if (demandas.length === 0) {
    return (
      <Card className="flex flex-col gap-2">
        <p className="text-sm text-tinta-suave">Nenhuma demanda aberta agora. Volta mais tarde.</p>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {erro && <p className="text-sm text-terracota-escuro">{erro}</p>}
      {demandas.map((demanda) => (
        <Card key={demanda.id} className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            {demanda.categoria && (
              <span className="rounded-full bg-verde/10 px-2.5 py-1 text-xs font-semibold text-verde-escuro">
                {demanda.categoria}
              </span>
            )}
            {demanda.valor_oferecido !== null && (
              <span className="text-sm font-bold text-tinta">{formatarReais(demanda.valor_oferecido)}</span>
            )}
          </div>
          <p className="text-sm text-tinta">{demanda.descricao}</p>
          <div className="flex gap-3 text-xs text-tinta-suave">
            {demanda.local && <span>📍 {demanda.local}</span>}
            {demanda.prazo && <span>🕒 {demanda.prazo}</span>}
          </div>

          {usuarioLogado ? (
            <Botao
              type="button"
              variante={interessadas.has(demanda.id) ? "secundario" : "primario"}
              className="mt-1 !py-2 text-sm"
              disabled={interessadas.has(demanda.id) || processando === demanda.id}
              onClick={() => manifestarInteresse(demanda)}
            >
              {interessadas.has(demanda.id)
                ? "Interesse enviado ✅"
                : processando === demanda.id
                  ? "Enviando..."
                  : "Tenho interesse"}
            </Botao>
          ) : (
            <p className="text-xs text-tinta-suave">Entra na tua conta pra manifestar interesse.</p>
          )}
        </Card>
      ))}
    </div>
  );
}
