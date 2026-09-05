"use client";

import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/client";

type Produto = {
  id: string;
  nome: string;
  descricao: string | null;
  preco: number | null;
  tipo: "produto" | "servico";
};

function formatarReais(valor: number | null): string {
  if (valor === null) return "Sob consulta";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function FormularioPedirCatalogo({
  empresaId,
  empresaNome,
  ownerId,
  produtos,
}: {
  empresaId: string;
  empresaNome: string;
  ownerId: string | null;
  produtos: Produto[];
}) {
  const supabase = createClient();
  const [selecionado, setSelecionado] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState("1");
  const [observacao, setObservacao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [enviado, setEnviado] = useState<string | null>(null);

  if (produtos.length === 0) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selecionado) return;
    setMensagemErro("");

    const qtd = Number(quantidade);
    if (!Number.isInteger(qtd) || qtd < 1) {
      setMensagemErro("Quantidade inválida.");
      return;
    }

    setCarregando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMensagemErro("Sessão expirada. Recarrega a página e tenta de novo.");
      setCarregando(false);
      return;
    }

    const { data: perfil } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .maybeSingle();

    const nomeCliente = (user.user_metadata?.name as string | undefined)?.trim() || "";

    const { error } = await supabase.from("pedidos_catalogo").insert({
      empresa_id: empresaId,
      produto_id: selecionado.id,
      cliente_profile_id: user.id,
      nome_produto: selecionado.nome,
      preco_unitario: selecionado.preco,
      quantidade: qtd,
      nome_cliente: nomeCliente,
      telefone_cliente: perfil?.phone ?? null,
      observacao: observacao.trim() || null,
      status: "pendente",
    });

    if (error) {
      setMensagemErro("Não consegui enviar o pedido. Tenta de novo em instantes.");
      setCarregando(false);
      return;
    }

    if (ownerId) {
      fetch("/api/push/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: ownerId,
          titulo: `Novo pedido — ${empresaNome}`,
          corpo: `${nomeCliente || "Alguém"} quer ${qtd}x ${selecionado.nome}. Confirma no painel.`,
          url: "/app/empresa",
        }),
      }).catch(() => {});
    }

    setEnviado(selecionado.nome);
    setCarregando(false);
  }

  if (enviado) {
    return (
      <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
        Pedido de {enviado} enviado! Avisamos assim que {empresaNome} confirmar. Prontim ✅
      </p>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <Selo variante="verde">Catálogo</Selo>
      <div className="flex flex-col gap-2">
        {produtos.map((produto) => (
          <button
            key={produto.id}
            type="button"
            onClick={() => {
              setSelecionado(produto);
              setQuantidade("1");
              setObservacao("");
              setMensagemErro("");
            }}
            className={`flex items-center justify-between gap-3 rounded-lg border-2 p-3 text-left transition-colors ${
              selecionado?.id === produto.id
                ? "border-verde bg-verde/10"
                : "border-papel-2 bg-white/60"
            }`}
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-tinta">{produto.nome}</p>
              {produto.descricao && (
                <p className="truncate text-xs text-tinta-suave">{produto.descricao}</p>
              )}
            </div>
            <span className="shrink-0 text-sm font-bold text-verde-escuro">
              {formatarReais(produto.preco)}
            </span>
          </button>
        ))}
      </div>

      {selecionado && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 border-t border-papel-2 pt-3">
          <p className="text-sm text-tinta-suave">
            Pedindo: <span className="font-semibold text-tinta">{selecionado.nome}</span>
          </p>
          <Campo
            rotulo="Quantidade"
            type="number"
            min={1}
            required
            value={quantidade}
            onChange={(e) => setQuantidade(e.target.value)}
          />
          <Campo
            rotulo="Alguma observação? (opcional)"
            type="text"
            placeholder="Ex: sem cebola"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
          {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
          <Botao type="submit" disabled={carregando}>
            {carregando ? "Enviando..." : "Pedir"}
          </Botao>
        </form>
      )}
    </Card>
  );
}
