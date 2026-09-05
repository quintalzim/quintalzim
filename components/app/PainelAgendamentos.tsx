"use client";

import { useState } from "react";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/client";

type Agendamento = {
  id: string;
  cliente_profile_id: string;
  nome_cliente: string | null;
  telefone_cliente: string | null;
  servico: string | null;
  data_hora_desejada: string;
  observacao: string | null;
  status: string;
};

function formatarDataHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// Não tem duração de serviço cadastrada ainda, então usamos uma janela fixa
// como aproximação de "horário ocupado": dois confirmados a menos de 1h de
// distância viram um alerta de possível conflito.
const JANELA_CONFLITO_MS = 60 * 60 * 1000;

export default function PainelAgendamentos({
  empresaId,
  empresaNome,
  agendamentosIniciais,
}: {
  empresaId: string;
  empresaNome: string;
  agendamentosIniciais: Agendamento[];
}) {
  const supabase = createClient();
  const [agendamentos, setAgendamentos] = useState(agendamentosIniciais);
  const [processando, setProcessando] = useState<string | null>(null);

  // Substituem window.confirm/window.prompt por modais no padrão visual do app.
  const [conflito, setConflito] = useState<{ agendamento: Agendamento; lista: string } | null>(null);
  const [modalValor, setModalValor] = useState<Agendamento | null>(null);
  const [valorInput, setValorInput] = useState("");

  async function iniciarConfirmacao(agendamento: Agendamento) {
    const alvo = new Date(agendamento.data_hora_desejada).getTime();
    const inicioJanela = new Date(alvo - JANELA_CONFLITO_MS).toISOString();
    const fimJanela = new Date(alvo + JANELA_CONFLITO_MS).toISOString();

    const { data: conflitos } = await supabase
      .from("agendamentos")
      .select("nome_cliente, data_hora_desejada")
      .eq("empresa_id", empresaId)
      .eq("status", "confirmado")
      .neq("id", agendamento.id)
      .gte("data_hora_desejada", inicioJanela)
      .lte("data_hora_desejada", fimJanela);

    if (conflitos && conflitos.length > 0) {
      const lista = conflitos
        .map((c) => `${c.nome_cliente || "Cliente"} às ${formatarDataHora(c.data_hora_desejada)}`)
        .join(", ");
      setConflito({ agendamento, lista });
      return;
    }

    setValorInput("");
    setModalValor(agendamento);
  }

  async function confirmarComValor(agendamento: Agendamento, valorDigitado: string) {
    let valor: number | null = null;
    if (valorDigitado.trim() !== "") {
      const normalizado = Number(valorDigitado.replace(",", "."));
      if (!Number.isNaN(normalizado) && normalizado >= 0) {
        valor = normalizado;
      }
    }
    setModalValor(null);
    await atualizarStatus(agendamento, "confirmado", valor);
  }

  async function atualizarStatus(
    agendamento: Agendamento,
    novoStatus: "confirmado" | "recusado",
    valor: number | null = null
  ) {
    setProcessando(agendamento.id);

    const { error } = await supabase
      .from("agendamentos")
      .update({ status: novoStatus, ...(valor !== null ? { valor } : {}) })
      .eq("id", agendamento.id);

    if (!error) {
      setAgendamentos((atual) =>
        atual.map((item) => (item.id === agendamento.id ? { ...item, status: novoStatus } : item))
      );

      fetch("/api/push/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: agendamento.cliente_profile_id,
          agendamentoId: agendamento.id,
          titulo:
            novoStatus === "confirmado"
              ? `${empresaNome} confirmou teu horário`
              : `${empresaNome} não vai poder te atender nesse horário`,
          corpo:
            novoStatus === "confirmado"
              ? `${agendamento.servico || "Seu horário"} confirmado pra ${formatarDataHora(agendamento.data_hora_desejada)}. Prontim ✅`
              : "Tenta pedir outro horário quando quiser.",
        }),
      }).catch(() => {});
    }

    setProcessando(null);
  }

  const pendentes = agendamentos.filter((a) => a.status === "pendente");
  const outros = agendamentos.filter((a) => a.status !== "pendente").slice(0, 5);

  return (
    <>
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-tinta">Pedidos de horário</h2>
        {pendentes.length > 0 && <Selo variante="terracota">{pendentes.length} pendente(s)</Selo>}
      </div>

      {pendentes.length === 0 && outros.length === 0 && (
        <p className="text-sm text-tinta-suave">
          Nenhum pedido ainda. Assim que alguém pedir horário pela tua Vitrine, aparece aqui.
        </p>
      )}

      {pendentes.map((agendamento) => (
        <div key={agendamento.id} className="flex flex-col gap-2 rounded-lg bg-amarelo/10 p-3">
          <div>
            <p className="font-semibold text-tinta">{agendamento.nome_cliente || "Cliente"}</p>
            <p className="text-sm text-tinta-suave">
              {agendamento.servico || "Sem detalhe"} — {formatarDataHora(agendamento.data_hora_desejada)}
            </p>
            {agendamento.telefone_cliente && (
              <p className="text-xs text-tinta-suave">Tel: {agendamento.telefone_cliente}</p>
            )}
            {agendamento.observacao && (
              <p className="text-xs text-tinta-suave">Obs: {agendamento.observacao}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Botao
              type="button"
              className="flex-1 !py-2 text-sm"
              disabled={processando === agendamento.id}
              onClick={() => iniciarConfirmacao(agendamento)}
            >
              Confirmar
            </Botao>
            <Botao
              type="button"
              variante="secundario"
              className="flex-1 !py-2 text-sm"
              disabled={processando === agendamento.id}
              onClick={() => atualizarStatus(agendamento, "recusado")}
            >
              Recusar
            </Botao>
          </div>
        </div>
      ))}

      {outros.length > 0 && (
        <div className="flex flex-col gap-1 border-t border-papel-2 pt-3">
          <p className="text-xs font-semibold text-tinta-suave">Últimos resolvidos</p>
          {outros.map((agendamento) => (
            <p key={agendamento.id} className="text-sm text-tinta-suave">
              {agendamento.nome_cliente || "Cliente"} — {agendamento.servico || ""} —{" "}
              {agendamento.status === "confirmado" ? "confirmado ✅" : "recusado"}
            </p>
          ))}
        </div>
      )}
    </Card>

    {conflito && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/40 p-4">
        <Card className="flex w-full max-w-sm flex-col gap-3">
          <Selo variante="terracota">Conflito de horário</Selo>
          <p className="text-sm text-tinta">
            Já tem horário confirmado perto desse: <span className="font-semibold">{conflito.lista}</span>.
            Confirmar esse também?
          </p>
          <div className="flex gap-2">
            <Botao
              type="button"
              variante="secundario"
              className="flex-1 !py-2 text-sm"
              onClick={() => setConflito(null)}
            >
              Cancelar
            </Botao>
            <Botao
              type="button"
              className="flex-1 !py-2 text-sm"
              onClick={() => {
                const agendamento = conflito.agendamento;
                setConflito(null);
                setValorInput("");
                setModalValor(agendamento);
              }}
            >
              Confirmar mesmo assim
            </Botao>
          </div>
        </Card>
      </div>
    )}

    {modalValor && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/40 p-4">
        <Card className="flex w-full max-w-sm flex-col gap-3">
          <Selo variante="verde">Confirmar horário</Selo>
          <p className="text-sm text-tinta-suave">
            Valor do serviço (R$) — deixa em branco se não quiser registrar agora. Isso alimenta a
            Gestão/DRE da tua Empresa.
          </p>
          <input
            type="text"
            inputMode="decimal"
            autoFocus
            value={valorInput}
            onChange={(e) => setValorInput(e.target.value)}
            placeholder="Ex: 25,00"
            className="rounded-lg border border-papel-2 bg-papel px-3 py-2 text-sm text-tinta outline-none focus:border-verde"
          />
          <div className="flex gap-2">
            <Botao
              type="button"
              variante="secundario"
              className="flex-1 !py-2 text-sm"
              onClick={() => setModalValor(null)}
            >
              Cancelar
            </Botao>
            <Botao
              type="button"
              className="flex-1 !py-2 text-sm"
              onClick={() => confirmarComValor(modalValor, valorInput)}
            >
              Confirmar horário
            </Botao>
          </div>
        </Card>
      </div>
    )}
    </>
  );
}
