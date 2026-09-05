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
  ativo: boolean;
};

function formatarReais(valor: number | null): string {
  if (valor === null) return "Sem preço";
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PainelCatalogo({
  empresaId,
  produtosIniciais,
}: {
  empresaId: string;
  produtosIniciais: Produto[];
}) {
  const supabase = createClient();
  const [produtos, setProdutos] = useState(produtosIniciais);
  const [processando, setProcessando] = useState<string | null>(null);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Produto | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [preco, setPreco] = useState("");
  const [tipo, setTipo] = useState<"produto" | "servico">("produto");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [remover, setRemover] = useState<Produto | null>(null);

  function abrirNovo() {
    setEditando(null);
    setNome("");
    setDescricao("");
    setPreco("");
    setTipo("produto");
    setErro("");
    setFormAberto(true);
  }

  function abrirEdicao(produto: Produto) {
    setEditando(produto);
    setNome(produto.nome);
    setDescricao(produto.descricao ?? "");
    setPreco(produto.preco !== null ? String(produto.preco).replace(".", ",") : "");
    setTipo(produto.tipo);
    setErro("");
    setFormAberto(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Dá um nome pro item.");
      return;
    }

    let precoNumerico: number | null = null;
    if (preco.trim() !== "") {
      const normalizado = Number(preco.replace(",", "."));
      if (Number.isNaN(normalizado) || normalizado < 0) {
        setErro("Preço inválido.");
        return;
      }
      precoNumerico = normalizado;
    }

    setSalvando(true);

    if (editando) {
      const { error } = await supabase
        .from("produtos_empresa")
        .update({
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          preco: precoNumerico,
          tipo,
        })
        .eq("id", editando.id);

      if (error) {
        setErro("Não consegui salvar. Tenta de novo.");
        setSalvando(false);
        return;
      }

      setProdutos((atual) =>
        atual.map((p) =>
          p.id === editando.id
            ? { ...p, nome: nome.trim(), descricao: descricao.trim() || null, preco: precoNumerico, tipo }
            : p
        )
      );
    } else {
      const { data, error } = await supabase
        .from("produtos_empresa")
        .insert({
          empresa_id: empresaId,
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          preco: precoNumerico,
          tipo,
          ativo: true,
        })
        .select("id, nome, descricao, preco, tipo, ativo")
        .single();

      if (error || !data) {
        setErro("Não consegui salvar. Tenta de novo.");
        setSalvando(false);
        return;
      }

      setProdutos((atual) => [...atual, data as Produto]);
    }

    setSalvando(false);
    setFormAberto(false);
  }

  async function alternarAtivo(produto: Produto) {
    setProcessando(produto.id);
    const { error } = await supabase
      .from("produtos_empresa")
      .update({ ativo: !produto.ativo })
      .eq("id", produto.id);

    if (!error) {
      setProdutos((atual) =>
        atual.map((p) => (p.id === produto.id ? { ...p, ativo: !p.ativo } : p))
      );
    }
    setProcessando(null);
  }

  async function confirmarRemocao() {
    if (!remover) return;
    setProcessando(remover.id);
    const { error } = await supabase.from("produtos_empresa").delete().eq("id", remover.id);
    if (!error) {
      setProdutos((atual) => atual.filter((p) => p.id !== remover.id));
    }
    setProcessando(null);
    setRemover(null);
  }

  return (
    <>
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-tinta">Catálogo</h2>
          <Selo variante="verde">{produtos.filter((p) => p.ativo).length} ativo(s)</Selo>
        </div>
        <p className="text-sm text-tinta-suave">
          Produtos e serviços que aparecem na tua Vitrine. O cliente pede por ali e você confirma —
          sem cobrança automática ainda.
        </p>

        {produtos.length === 0 && (
          <p className="text-sm text-tinta-suave">
            Nenhum item cadastrado ainda. Adiciona o primeiro produto ou serviço.
          </p>
        )}

        {produtos.map((produto) => (
          <div
            key={produto.id}
            className={`flex items-center justify-between gap-3 rounded-lg p-3 ${
              produto.ativo ? "bg-verde/10" : "bg-papel-2/60"
            }`}
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-tinta">{produto.nome}</p>
              <p className="text-sm text-tinta-suave">
                {produto.tipo === "servico" ? "Serviço" : "Produto"} — {formatarReais(produto.preco)}
              </p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Botao
                type="button"
                variante="secundario"
                className="!px-3 !py-2 text-xs"
                onClick={() => abrirEdicao(produto)}
              >
                Editar
              </Botao>
              <Botao
                type="button"
                variante="secundario"
                className="!px-3 !py-2 text-xs"
                disabled={processando === produto.id}
                onClick={() => alternarAtivo(produto)}
              >
                {produto.ativo ? "Pausar" : "Ativar"}
              </Botao>
              <button
                type="button"
                className="px-2 text-xs font-semibold text-terracota-escuro disabled:opacity-50"
                disabled={processando === produto.id}
                onClick={() => setRemover(produto)}
              >
                Remover
              </button>
            </div>
          </div>
        ))}

        <Botao type="button" variante="secundario" onClick={abrirNovo}>
          + Adicionar item
        </Botao>
      </Card>

      {formAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/40 p-4">
          <Card className="flex w-full max-w-sm flex-col gap-3">
            <Selo variante="verde">{editando ? "Editar item" : "Novo item"}</Selo>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Campo
                rotulo="Nome"
                type="text"
                placeholder="Ex: Corte de cabelo"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <Campo
                rotulo="Descrição (opcional)"
                type="text"
                placeholder="Ex: Corte + escova"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
              <Campo
                rotulo="Preço (opcional)"
                type="text"
                inputMode="decimal"
                placeholder="Ex: 35,00"
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
              />
              <div className="flex flex-col gap-1.5">
                <label className="font-titulo text-sm font-semibold text-tinta">Tipo</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setTipo("produto")}
                    className={`flex-1 rounded-md border-2 px-3 py-2 text-sm font-semibold ${
                      tipo === "produto"
                        ? "border-verde bg-verde/10 text-verde-escuro"
                        : "border-papel-2 text-tinta-suave"
                    }`}
                  >
                    Produto
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipo("servico")}
                    className={`flex-1 rounded-md border-2 px-3 py-2 text-sm font-semibold ${
                      tipo === "servico"
                        ? "border-verde bg-verde/10 text-verde-escuro"
                        : "border-papel-2 text-tinta-suave"
                    }`}
                  >
                    Serviço
                  </button>
                </div>
              </div>
              {erro && <p className="text-sm text-terracota-escuro">{erro}</p>}
              <div className="flex gap-2">
                <Botao
                  type="button"
                  variante="secundario"
                  className="flex-1 !py-2 text-sm"
                  onClick={() => setFormAberto(false)}
                >
                  Cancelar
                </Botao>
                <Botao type="submit" className="flex-1 !py-2 text-sm" disabled={salvando}>
                  {salvando ? "Salvando..." : "Salvar"}
                </Botao>
              </div>
            </form>
          </Card>
        </div>
      )}

      {remover && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/40 p-4">
          <Card className="flex w-full max-w-sm flex-col gap-3">
            <Selo variante="terracota">Remover item</Selo>
            <p className="text-sm text-tinta">
              Tem certeza que quer remover <span className="font-semibold">{remover.nome}</span> do
              catálogo? Isso não apaga pedidos já feitos.
            </p>
            <div className="flex gap-2">
              <Botao
                type="button"
                variante="secundario"
                className="flex-1 !py-2 text-sm"
                onClick={() => setRemover(null)}
              >
                Cancelar
              </Botao>
              <Botao type="button" className="flex-1 !py-2 text-sm" onClick={confirmarRemocao}>
                Remover
              </Botao>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
