"use client";

import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/client";

type Plano = {
  id: string;
  nome: string;
  descricao: string | null;
  valor: number | null;
  ativo: boolean;
};

function formatarReais(valor: number | null): string {
  if (valor === null) return "Sem valor";
  return `${valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês`;
}

export default function PainelClube({
  empresaId,
  planosIniciais,
}: {
  empresaId: string;
  planosIniciais: Plano[];
}) {
  const supabase = createClient();
  const [planos, setPlanos] = useState(planosIniciais);
  const [processando, setProcessando] = useState<string | null>(null);

  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<Plano | null>(null);
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [remover, setRemover] = useState<Plano | null>(null);

  function abrirNovo() {
    setEditando(null);
    setNome("");
    setDescricao("");
    setValor("");
    setErro("");
    setFormAberto(true);
  }

  function abrirEdicao(plano: Plano) {
    setEditando(plano);
    setNome(plano.nome);
    setDescricao(plano.descricao ?? "");
    setValor(plano.valor !== null ? String(plano.valor).replace(".", ",") : "");
    setErro("");
    setFormAberto(true);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");

    if (!nome.trim()) {
      setErro("Dá um nome pro plano.");
      return;
    }

    let valorNumerico: number | null = null;
    if (valor.trim() !== "") {
      const normalizado = Number(valor.replace(",", "."));
      if (Number.isNaN(normalizado) || normalizado < 0) {
        setErro("Valor inválido.");
        return;
      }
      valorNumerico = normalizado;
    }

    setSalvando(true);

    if (editando) {
      const { error } = await supabase
        .from("planos_clube")
        .update({ nome: nome.trim(), descricao: descricao.trim() || null, valor: valorNumerico })
        .eq("id", editando.id);

      if (error) {
        setErro("Não consegui salvar. Tenta de novo.");
        setSalvando(false);
        return;
      }

      setPlanos((atual) =>
        atual.map((p) =>
          p.id === editando.id
            ? { ...p, nome: nome.trim(), descricao: descricao.trim() || null, valor: valorNumerico }
            : p
        )
      );
    } else {
      const { data, error } = await supabase
        .from("planos_clube")
        .insert({
          empresa_id: empresaId,
          nome: nome.trim(),
          descricao: descricao.trim() || null,
          valor: valorNumerico,
          ativo: true,
        })
        .select("id, nome, descricao, valor, ativo")
        .single();

      if (error || !data) {
        setErro("Não consegui salvar. Tenta de novo.");
        setSalvando(false);
        return;
      }

      setPlanos((atual) => [...atual, data as Plano]);
    }

    setSalvando(false);
    setFormAberto(false);
  }

  async function alternarAtivo(plano: Plano) {
    setProcessando(plano.id);
    const { error } = await supabase
      .from("planos_clube")
      .update({ ativo: !plano.ativo })
      .eq("id", plano.id);

    if (!error) {
      setPlanos((atual) => atual.map((p) => (p.id === plano.id ? { ...p, ativo: !p.ativo } : p)));
    }
    setProcessando(null);
  }

  async function confirmarRemocao() {
    if (!remover) return;
    setProcessando(remover.id);
    const { error } = await supabase.from("planos_clube").delete().eq("id", remover.id);
    if (!error) {
      setPlanos((atual) => atual.filter((p) => p.id !== remover.id));
    }
    setProcessando(null);
    setRemover(null);
  }

  return (
    <>
      <Card className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-tinta">Clube de Assinaturas</h2>
          <Selo variante="verde">{planos.filter((p) => p.ativo).length} ativo(s)</Selo>
        </div>
        <p className="text-sm text-tinta-suave">
          Planos recorrentes que você oferece pros teus clientes (ex: &quot;Corte ilimitado —
          R$79/mês&quot;). Aparecem na tua Vitrine. A cobrança de verdade você combina por fora com
          o cliente — aqui é só o controle de quem assina.
        </p>

        {planos.length === 0 && (
          <p className="text-sm text-tinta-suave">Nenhum plano cadastrado ainda.</p>
        )}

        {planos.map((plano) => (
          <div
            key={plano.id}
            className={`flex items-center justify-between gap-3 rounded-lg p-3 ${
              plano.ativo ? "bg-verde/10" : "bg-papel-2/60"
            }`}
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-tinta">{plano.nome}</p>
              <p className="text-sm text-tinta-suave">{formatarReais(plano.valor)}</p>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Botao
                type="button"
                variante="secundario"
                className="!px-3 !py-2 text-xs"
                onClick={() => abrirEdicao(plano)}
              >
                Editar
              </Botao>
              <Botao
                type="button"
                variante="secundario"
                className="!px-3 !py-2 text-xs"
                disabled={processando === plano.id}
                onClick={() => alternarAtivo(plano)}
              >
                {plano.ativo ? "Pausar" : "Ativar"}
              </Botao>
              <button
                type="button"
                className="px-2 text-xs font-semibold text-terracota-escuro disabled:opacity-50"
                disabled={processando === plano.id}
                onClick={() => setRemover(plano)}
              >
                Remover
              </button>
            </div>
          </div>
        ))}

        <Botao type="button" variante="secundario" onClick={abrirNovo}>
          + Adicionar plano
        </Botao>
      </Card>

      {formAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/40 p-4">
          <Card className="flex w-full max-w-sm flex-col gap-3">
            <Selo variante="verde">{editando ? "Editar plano" : "Novo plano"}</Selo>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Campo
                rotulo="Nome"
                type="text"
                placeholder="Ex: Corte ilimitado"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
              <Campo
                rotulo="Descrição (opcional)"
                type="text"
                placeholder="Ex: Até 4 cortes por mês"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
              <Campo
                rotulo="Valor mensal (opcional)"
                type="text"
                inputMode="decimal"
                placeholder="Ex: 79,00"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
              />
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
            <Selo variante="terracota">Remover plano</Selo>
            <p className="text-sm text-tinta">
              Tem certeza que quer remover <span className="font-semibold">{remover.nome}</span> do
              Clube? Isso não cancela quem já assina.
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
