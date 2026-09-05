"use client";

import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import type { CategoriaPlano, Plano } from "@/lib/planos";

type Assinatura = {
  status: string;
  plano: string;
} | null;

function rotuloStatus(status: string): string {
  if (status === "ativa") return "Ativa ✅";
  if (status === "pendente") return "Aguardando pagamento";
  if (status === "inadimplente") return "Pagamento atrasado";
  if (status === "cancelada") return "Cancelada";
  return status;
}

function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PainelAssinatura({
  categoria,
  planos,
  assinatura,
  cpfAtual,
}: {
  categoria: CategoriaPlano;
  planos: Plano[];
  assinatura: Assinatura;
  cpfAtual: string;
}) {
  const [planoEscolhido, setPlanoEscolhido] = useState(planos[0]?.id ?? "");
  const [cpf, setCpf] = useState(cpfAtual);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function assinar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    const cpfLimpo = cpf.replace(/\D/g, "");
    if (cpfLimpo.length !== 11) {
      setErro("Digita um CPF válido (só números ou com pontos/traço).");
      return;
    }

    setCarregando(true);
    try {
      const resposta = await fetch("/api/asaas/assinar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf: cpfLimpo, plano: planoEscolhido }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || "Não consegui criar a assinatura agora.");
        setCarregando(false);
        return;
      }
      if (dados.invoiceUrl) {
        window.location.href = dados.invoiceUrl;
        return;
      }
      setErro("Assinatura criada, mas não recebi o link de pagamento. Atualiza a página.");
    } catch {
      setErro("Não consegui criar a assinatura agora. Tenta de novo.");
    }
    setCarregando(false);
  }

  async function sincronizar() {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/asaas/sincronizar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || "Não consegui checar agora.");
        setCarregando(false);
        return;
      }
      if (dados.status === "pendente") {
        setErro("Ainda não achei o pagamento confirmado no Asaas. Tenta de novo em um instante.");
        setCarregando(false);
        return;
      }
      window.location.reload();
    } catch {
      setErro("Não consegui checar agora. Tenta de novo.");
      setCarregando(false);
    }
  }

  async function cancelar() {
    setCarregando(true);
    setErro("");
    try {
      const resposta = await fetch("/api/asaas/cancelar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoria }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || "Não consegui cancelar agora.");
        setCarregando(false);
        return;
      }
      window.location.reload();
    } catch {
      setErro("Não consegui cancelar agora. Tenta de novo.");
      setCarregando(false);
    }
  }

  if (assinatura && assinatura.status !== "cancelada") {
    const planoAtual = planos.find((p) => p.id === assinatura.plano);
    return (
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-tinta-suave">{planoAtual?.nome ?? assinatura.plano}</span>
          <span className="font-semibold text-tinta">{rotuloStatus(assinatura.status)}</span>
        </div>
        {assinatura.status === "pendente" && (
          <>
            <p className="text-xs text-tinta-suave">
              Assim que o Pix cair, sua assinatura fica ativa automaticamente. Se já pagou e não
              atualizou, clica abaixo pra checar direto com o Asaas.
            </p>
            <Botao type="button" variante="secundario" disabled={carregando} onClick={sincronizar}>
              {carregando ? "Checando..." : "Já paguei — verificar agora"}
            </Botao>
          </>
        )}
        {assinatura.status === "inadimplente" && (
          <p className="text-xs text-terracota-escuro">
            O último pagamento não foi confirmado. Verifica o Pix pendente no seu app do banco.
          </p>
        )}
        {erro && <p className="text-sm text-terracota-escuro">{erro}</p>}
        {(assinatura.status === "ativa" || assinatura.status === "inadimplente") && (
          <Botao type="button" variante="secundario" disabled={carregando} onClick={cancelar}>
            {carregando ? "Cancelando..." : "Cancelar assinatura"}
          </Botao>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={assinar} className="flex flex-col gap-3">
      {planos.length > 1 ? (
        <div className="flex flex-col gap-2">
          {planos.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPlanoEscolhido(p.id)}
              className={`flex items-center justify-between gap-3 rounded-lg border-2 p-3 text-left transition-colors ${
                planoEscolhido === p.id ? "border-verde bg-verde/10" : "border-papel-2 bg-white/60"
              }`}
            >
              <div>
                <p className="font-semibold text-tinta">{p.nome}</p>
                <p className="text-xs text-tinta-suave">{p.descricao}</p>
              </div>
              <span className="shrink-0 font-bold text-verde-escuro">{formatarReais(p.valor)}/mês</span>
            </button>
          ))}
        </div>
      ) : (
        <p className="text-sm text-tinta-suave">
          {planos[0]?.nome} — <span className="font-semibold text-tinta">{formatarReais(planos[0]?.valor ?? 0)}/mês</span>,
          via Pix recorrente.
        </p>
      )}
      <Campo
        rotulo="CPF"
        type="text"
        placeholder="000.000.000-00"
        value={cpf}
        onChange={(e) => setCpf(e.target.value)}
        required
      />
      {erro && <p className="text-sm text-terracota-escuro">{erro}</p>}
      <Botao type="submit" disabled={carregando}>
        {carregando ? "Preparando..." : "Assinar por Pix"}
      </Botao>
    </form>
  );
}
