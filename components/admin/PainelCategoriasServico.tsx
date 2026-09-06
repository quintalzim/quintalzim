"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import Selo from "@/components/ui/Selo";
import type { CategoriaServico } from "@/lib/categorias-servico";

export default function PainelCategoriasServico({
  categoriasIniciais,
}: {
  categoriasIniciais: CategoriaServico[];
}) {
  const router = useRouter();
  const [categorias, setCategorias] = useState(categoriasIniciais);
  const [nome, setNome] = useState("");
  const [emoji, setEmoji] = useState("");
  const [descricao, setDescricao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [alternandoId, setAlternandoId] = useState<string | null>(null);
  const [erro, setErro] = useState("");

  async function handleCriar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    if (!nome.trim()) {
      setErro("Conta o nome do tipo de serviço.");
      return;
    }
    setCarregando(true);

    const resposta = await fetch("/api/admin/categorias", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, emoji: emoji || null, descricao: descricao || null }),
    });
    const corpo = await resposta.json().catch(() => null);

    if (!resposta.ok) {
      setErro(corpo?.erro ?? "Não consegui criar a categoria.");
      setCarregando(false);
      return;
    }

    setCategorias((atual) => [...atual, corpo.categoria]);
    setNome("");
    setEmoji("");
    setDescricao("");
    setCarregando(false);
    router.refresh();
  }

  async function alternarAtivo(categoria: CategoriaServico) {
    setAlternandoId(categoria.id);
    const resposta = await fetch("/api/admin/categorias", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: categoria.id, ativo: !categoria.ativo }),
    });
    if (resposta.ok) {
      setCategorias((atual) =>
        atual.map((c) => (c.id === categoria.id ? { ...c, ativo: !c.ativo } : c))
      );
      router.refresh();
    }
    setAlternandoId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        {categorias.length === 0 && (
          <p className="text-sm text-tinta-suave">Nenhuma categoria cadastrada ainda.</p>
        )}
        {categorias.map((c) => (
          <div
            key={c.id}
            className="flex items-center justify-between gap-2 rounded-lg border border-papel-2 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              {c.emoji && <span>{c.emoji}</span>}
              <div>
                <p className="text-sm font-semibold text-tinta">{c.nome}</p>
                <p className="text-xs text-tinta-suave">/marketplace/{c.slug}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Selo variante={c.ativo ? "verde" : "terracota"}>{c.ativo ? "Ativa" : "Inativa"}</Selo>
              <button
                type="button"
                onClick={() => alternarAtivo(c)}
                disabled={alternandoId === c.id}
                className="text-xs font-semibold text-verde-escuro underline underline-offset-2 disabled:opacity-50"
              >
                {c.ativo ? "Desativar" : "Ativar"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleCriar} className="flex flex-col gap-2 border-t border-papel-2 pt-3">
        <p className="text-xs font-semibold text-tinta-suave">Nova categoria de serviço</p>
        <div className="flex gap-2">
          <div className="w-16">
            <Campo rotulo="Emoji" type="text" placeholder="🔨" value={emoji} onChange={(e) => setEmoji(e.target.value)} />
          </div>
          <div className="flex-1">
            <Campo
              rotulo="Nome"
              type="text"
              placeholder="Ex: Marceneiro"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>
        </div>
        <Campo
          rotulo="Descrição curta (opcional)"
          type="text"
          placeholder="Ex: Móveis planejados e reparos em madeira."
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
        {erro && <p className="text-sm text-terracota-escuro">{erro}</p>}
        <Botao type="submit" disabled={carregando} className="mt-1">
          {carregando ? "Criando..." : "Criar categoria"}
        </Botao>
      </form>
    </div>
  );
}
