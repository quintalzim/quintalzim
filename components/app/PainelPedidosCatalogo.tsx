"use client";

import { useState } from "react";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/client";

type Pedido = {
  id: string;
  cliente_profile_id: string;
  nome_produto: string;
  preco_unitario: number | null;
  quantidade: number;
  nome_cliente: string | null;
  telefone_cliente: string | null;
  observacao: string | null;
  status: string;
};

function formatarReais(valor: number | null): string {
  if (valor === null) return "";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PainelPedidosCatalogo({
  empresaNome,
  pedidosIniciais,
}: {
  empresaNome: string;
  pedidosIniciais: Pedido[];
}) {
  const supabase = createClient();
  const [pedidos, setPedidos] = useState(pedidosIniciais);
  const [processando, setProcessando] = useState<string | null>(null);

  async function atualizarStatus(pedido: Pedido, novoStatus: "confirmado" | "recusado") {
    setProcessando(pedido.id);

    const { error } = await supabase
      .from("pedidos_catalogo")
      .update({ status: novoStatus })
      .eq("id", pedido.id);

    if (!error) {
      setPedidos((atual) =>
        atual.map((item) => (item.id === pedido.id ? { ...item, status: novoStatus } : item))
      );

      fetch("/api/push/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: pedido.cliente_profile_id,
          titulo:
            novoStatus === "confirmado"
              ? `${empresaNome} confirmou teu pedido`
              : `${empresaNome} não vai poder atender esse pedido`,
          corpo:
            novoStatus === "confirmado"
              ? `${pedido.nome_produto} confirmado. Prontim ✅`
              : "Tenta pedir de novo quando quiser.",
        }),
      }).catch(() => {});
    }

    setProcessando(null);
  }

  const pendentes = pedidos.filter((p) => p.status === "pendente");
  const outros = pedidos.filter((p) => p.status !== "pendente").slice(0, 5);

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-tinta">Pedidos do catálogo</h2>
        {pendentes.length > 0 && <Selo variante="terracota">{pendentes.length} pendente(s)</Selo>}
      </div>

      {pendentes.length === 0 && outros.length === 0 && (
        <p className="text-sm text-tinta-suave">
          Nenhum pedido ainda. Assim que alguém pedir algo do catálogo, aparece aqui.
        </p>
      )}

      {pendentes.map((pedido) => (
        <div key={pedido.id} className="flex flex-col gap-2 rounded-lg bg-amarelo/10 p-3">
          <div>
            <p className="font-semibold text-tinta">{pedido.nome_cliente || "Cliente"}</p>
            <p className="text-sm text-tinta-suave">
              {pedido.quantidade}x {pedido.nome_produto}
              {pedido.preco_unitario !== null && ` — ${formatarReais(pedido.preco_unitario)} cada`}
            </p>
            {pedido.telefone_cliente && (
              <p className="text-xs text-tinta-suave">Tel: {pedido.telefone_cliente}</p>
            )}
            {pedido.observacao && (
              <p className="text-xs text-tinta-suave">Obs: {pedido.observacao}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Botao
              type="button"
              className="flex-1 !py-2 text-sm"
              disabled={processando === pedido.id}
              onClick={() => atualizarStatus(pedido, "confirmado")}
            >
              Confirmar
            </Botao>
            <Botao
              type="button"
              variante="secundario"
              className="flex-1 !py-2 text-sm"
              disabled={processando === pedido.id}
              onClick={() => atualizarStatus(pedido, "recusado")}
            >
              Recusar
            </Botao>
          </div>
        </div>
      ))}

      {outros.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-papel-2 pt-3">
          <p className="text-xs font-semibold text-tinta-suave">Últimos resolvidos</p>
          {outros.map((pedido) => (
            <p key={pedido.id} className="text-sm text-tinta-suave">
              {pedido.nome_cliente || "Cliente"} — {pedido.quantidade}x {pedido.nome_produto} —{" "}
              {pedido.status === "confirmado" ? "confirmado ✅" : "recusado"}
            </p>
          ))}
        </div>
      )}
    </Card>
  );
}
