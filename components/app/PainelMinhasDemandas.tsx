"use client";

import { useState } from "react";
import Botao from "@/components/ui/Botao";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/client";

type Interesse = {
  id: string;
  profissional_profile_id: string;
  nome_interessado: string | null;
  contato_interessado: string | null;
  mensagem: string | null;
};

type Demanda = {
  id: string;
  categoria: string | null;
  descricao: string;
  local: string | null;
  prazo: string | null;
  valor_oferecido: number | null;
  status: string;
  interesses: Interesse[];
};

export default function PainelMinhasDemandas({ demandasIniciais }: { demandasIniciais: Demanda[] }) {
  const supabase = createClient();
  const [demandas, setDemandas] = useState(demandasIniciais);
  const [processando, setProcessando] = useState<string | null>(null);

  async function atualizarStatus(demanda: Demanda, novoStatus: "atendida" | "cancelada") {
    setProcessando(demanda.id);
    const { error } = await supabase
      .from("demandas_marketplace")
      .update({ status: novoStatus })
      .eq("id", demanda.id);

    if (!error) {
      setDemandas((atual) =>
        atual.map((d) => (d.id === demanda.id ? { ...d, status: novoStatus } : d))
      );
    }
    setProcessando(null);
  }

  if (demandas.length === 0) {
    return <p className="text-sm text-tinta-suave">Você ainda não publicou nenhuma demanda.</p>;
  }

  return (
    <div className="flex flex-col gap-3">
      {demandas.map((demanda) => (
        <div key={demanda.id} className="flex flex-col gap-2 rounded-lg bg-white/60 p-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-tinta">{demanda.descricao}</p>
            <Selo
              variante={
                demanda.status === "aberta"
                  ? "verde"
                  : demanda.status === "atendida"
                    ? "amarelo"
                    : "terracota"
              }
            >
              {demanda.status}
            </Selo>
          </div>

          {demanda.interesses.length === 0 ? (
            <p className="text-xs text-tinta-suave">Ninguém se interessou ainda.</p>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-xs font-semibold text-tinta-suave">
                {demanda.interesses.length} interessado(s):
              </p>
              {demanda.interesses.map((interesse) => (
                <p key={interesse.id} className="text-xs text-tinta">
                  {interesse.nome_interessado || "Alguém"}
                  {interesse.contato_interessado && ` — ${interesse.contato_interessado}`}
                </p>
              ))}
            </div>
          )}

          {demanda.status === "aberta" && (
            <div className="flex gap-2">
              <Botao
                type="button"
                className="flex-1 !py-2 text-xs"
                disabled={processando === demanda.id}
                onClick={() => atualizarStatus(demanda, "atendida")}
              >
                Marcar como atendida
              </Botao>
              <Botao
                type="button"
                variante="secundario"
                className="flex-1 !py-2 text-xs"
                disabled={processando === demanda.id}
                onClick={() => atualizarStatus(demanda, "cancelada")}
              >
                Cancelar
              </Botao>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
