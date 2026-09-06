"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import { createClient } from "@/lib/supabase/client";

export default function FormularioNovaDemanda({ autorProfileId }: { autorProfileId: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [descricao, setDescricao] = useState("");
  const [categoria, setCategoria] = useState("");
  const [local, setLocal] = useState("");
  const [prazo, setPrazo] = useState("");
  const [valor, setValor] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemErro("");
    setSucesso(false);

    if (!descricao.trim()) {
      setMensagemErro("Conta o que você precisa.");
      return;
    }

    setCarregando(true);

    let valorNumerico: number | undefined;
    if (valor.trim() !== "") {
      const normalizado = Number(valor.replace(",", "."));
      if (!Number.isNaN(normalizado) && normalizado >= 0) {
        valorNumerico = normalizado;
      }
    }

    let estruturado: { categoriaId: string | null; local: string | null; prazo: string | null; valor: number | null } = {
      categoriaId: null,
      local: local.trim() || null,
      prazo: prazo.trim() || null,
      valor: valorNumerico ?? null,
    };

    try {
      const resposta = await fetch("/api/marketplace/estruturar-demanda", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          descricao: descricao.trim(),
          categoria: categoria.trim() || undefined,
          local: local.trim() || undefined,
          prazo: prazo.trim() || undefined,
          valor: valorNumerico,
        }),
      });
      if (resposta.ok) {
        estruturado = await resposta.json();
      }
    } catch {
      // segue com o que a pessoa preencheu manualmente
    }

    const { error } = await supabase.from("demandas_marketplace").insert({
      autor_profile_id: autorProfileId,
      descricao: descricao.trim(),
      categoria_id: estruturado.categoriaId,
      local: estruturado.local,
      prazo: estruturado.prazo,
      valor_oferecido: estruturado.valor,
      status: "aberta",
    });

    if (error) {
      setMensagemErro("Não consegui publicar. Tenta de novo em instantes.");
      setCarregando(false);
      return;
    }

    setDescricao("");
    setCategoria("");
    setLocal("");
    setPrazo("");
    setValor("");
    setSucesso(true);
    setCarregando(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="descricao-demanda" className="font-titulo text-sm font-semibold text-tinta">
          O que você precisa?
        </label>
        <textarea
          id="descricao-demanda"
          rows={3}
          required
          placeholder="Ex: preciso de alguém pra montar um guarda-roupa novo essa semana"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="rounded-md border-2 border-papel-2 bg-white px-4 py-3 text-base text-tinta outline-none transition-colors placeholder:text-tinta-suave/60 focus:border-verde"
        />
      </div>
      <p className="text-xs text-tinta-suave">
        Os campos abaixo são opcionais — a IA tenta preencher o que faltar a partir da sua
        descrição.
      </p>
      <Campo
        rotulo="Categoria (opcional)"
        type="text"
        placeholder="Ex: montagem de móveis"
        value={categoria}
        onChange={(e) => setCategoria(e.target.value)}
      />
      <Campo
        rotulo="Local (opcional)"
        type="text"
        placeholder="Ex: Poços de Caldas"
        value={local}
        onChange={(e) => setLocal(e.target.value)}
      />
      <Campo
        rotulo="Prazo (opcional)"
        type="text"
        placeholder="Ex: essa semana"
        value={prazo}
        onChange={(e) => setPrazo(e.target.value)}
      />
      <Campo
        rotulo="Valor que você pretende pagar (opcional)"
        type="text"
        inputMode="decimal"
        placeholder="Ex: 80,00"
        value={valor}
        onChange={(e) => setValor(e.target.value)}
      />
      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
      {sucesso && (
        <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
          Demanda publicada. Prontim ✅
        </p>
      )}
      <Botao type="submit" disabled={carregando}>
        {carregando ? "Publicando..." : "Publicar demanda"}
      </Botao>
    </form>
  );
}
