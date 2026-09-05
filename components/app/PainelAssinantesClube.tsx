"use client";

import { useState } from "react";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/client";

type Assinante = {
  id: string;
  cliente_profile_id: string;
  nome_plano: string;
  valor_plano: number | null;
  nome_cliente: string | null;
  telefone_cliente: string | null;
  status: string;
};

function formatarReais(valor: number | null): string {
  if (valor === null) return "";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function rotuloStatus(status: string): string {
  if (status === "ativo") return "Ativo ✅";
  if (status === "atrasado") return "Atrasado";
  if (status === "cancelado") return "Cancelado";
  return "Pendente";
}

export default function PainelAssinantesClube({
  empresaNome,
  assinantesIniciais,
}: {
  empresaNome: string;
  assinantesIniciais: Assinante[];
}) {
  const supabase = createClient();
  const [assinantes, setAssinantes] = useState(assinantesIniciais);
  const [processando, setProcessando] = useState<string | null>(null);

  async function atualizarStatus(
    assinante: Assinante,
    novoStatus: "ativo" | "atrasado" | "cancelado"
  ) {
    setProcessando(assinante.id);

    const { error } = await supabase
      .from("assinaturas_clube")
      .update({ status: novoStatus, updated_at: new Date().toISOString() })
      .eq("id", assinante.id);

    if (!error) {
      setAssinantes((atual) =>
        atual.map((item) => (item.id === assinante.id ? { ...item, status: novoStatus } : item))
      );

      if (novoStatus !== "cancelado") {
        fetch("/api/push/enviar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            profileId: assinante.cliente_profile_id,
            assinaturaClubeId: assinante.id,
            titulo:
              novoStatus === "ativo"
                ? `${empresaNome} confirmou tua assinatura`
                : `Assinatura em atraso — ${empresaNome}`,
            corpo:
              novoStatus === "ativo"
                ? `${assinante.nome_plano} confirmado. Prontim ✅`
                : "Regulariza o pagamento pra manter o plano ativo.",
          }),
        }).catch(() => {});
      }
    }

    setProcessando(null);
  }

  const pendentes = assinantes.filter((a) => a.status === "pendente");
  const ativos = assinantes.filter((a) => a.status === "ativo" || a.status === "atrasado");
  const outros = assinantes.filter((a) => a.status === "cancelado").slice(0, 5);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-tinta">Assinantes do Clube</h2>
        {pendentes.length > 0 && <Selo variante="terracota">{pendentes.length} pendente(s)</Selo>}
      </div>

      {pendentes.length === 0 && ativos.length === 0 && outros.length === 0 && (
        <p className="text-sm text-tinta-suave">
          Ninguém pediu pra entrar no Clube ainda. Assim que alguém pedir, aparece aqui.
        </p>
      )}

      {pendentes.map((assinante) => (
        <div key={assinante.id} className="flex flex-col gap-2 rounded-lg bg-amarelo/10 p-3">
          <div>
            <p className="font-semibold text-tinta">{assinante.nome_cliente || "Cliente"}</p>
            <p className="text-sm text-tinta-suave">
              {assinante.nome_plano}
              {assinante.valor_plano !== null && ` — ${formatarReais(assinante.valor_plano)}/mês`}
            </p>
            {assinante.telefone_cliente && (
              <p className="text-xs text-tinta-suave">Tel: {assinante.telefone_cliente}</p>
            )}
          </div>
          <p className="text-xs text-tinta-suave">
            Combina o pagamento por fora e depois confirma aqui.
          </p>
          <div className="flex gap-2">
            <Botao
              type="button"
              className="flex-1 !py-2 text-sm"
              disabled={processando === assinante.id}
              onClick={() => atualizarStatus(assinante, "ativo")}
            >
              Confirmar pagamento
            </Botao>
            <Botao
              type="button"
              variante="secundario"
              className="flex-1 !py-2 text-sm"
              disabled={processando === assinante.id}
              onClick={() => atualizarStatus(assinante, "cancelado")}
            >
              Recusar
            </Botao>
          </div>
        </div>
      ))}

      {ativos.map((assinante) => (
        <div key={assinante.id} className="flex flex-col gap-2 rounded-lg bg-verde/10 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate font-semibold text-tinta">{assinante.nome_cliente || "Cliente"}</p>
              <p className="text-sm text-tinta-suave">
                {assinante.nome_plano}
                {assinante.valor_plano !== null && ` — ${formatarReais(assinante.valor_plano)}/mês`}
              </p>
            </div>
            <Selo variante={assinante.status === "atrasado" ? "terracota" : "verde"}>
              {rotuloStatus(assinante.status)}
            </Selo>
          </div>
          <div className="flex gap-2">
            {assinante.status === "atrasado" ? (
              <Botao
                type="button"
                className="flex-1 !py-2 text-sm"
                disabled={processando === assinante.id}
                onClick={() => atualizarStatus(assinante, "ativo")}
              >
                Marcar em dia
              </Botao>
            ) : (
              <Botao
                type="button"
                variante="secundario"
                className="flex-1 !py-2 text-sm"
                disabled={processando === assinante.id}
                onClick={() => atualizarStatus(assinante, "atrasado")}
              >
                Marcar atrasado
              </Botao>
            )}
            <button
              type="button"
              className="px-2 text-xs font-semibold text-terracota-escuro disabled:opacity-50"
              disabled={processando === assinante.id}
              onClick={() => atualizarStatus(assinante, "cancelado")}
            >
              Cancelar
            </button>
          </div>
        </div>
      ))}

      {outros.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-papel-2 pt-3">
          <p className="text-xs font-semibold text-tinta-suave">Cancelados recentemente</p>
          {outros.map((assinante) => (
            <p key={assinante.id} className="text-sm text-tinta-suave">
              {assinante.nome_cliente || "Cliente"} — {assinante.nome_plano}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
