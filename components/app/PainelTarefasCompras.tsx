"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/client";

type Tipo = "tarefa" | "compra";

type Item = {
  id: string;
  tipo: Tipo;
  texto: string;
  quantidade: string | null;
  concluido: boolean;
  prazo: string | null;
  prioridade: string | null;
  origem: string;
};

function formatarPrazo(prazo: string | null): string | null {
  if (!prazo) return null;
  const data = new Date(prazo);
  return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
}

// Reconhecimento de voz do navegador (Web Speech API) — Chrome/Edge/Safari
// recentes têm; se não tiver, o botão de microfone simplesmente não aparece.
type ReconhecimentoVoz = {
  lang: string;
  interimResults: boolean;
  onresult: (event: { results: { transcript: string }[][] } & Record<string, unknown>) => void;
  onerror: () => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
};

function criarReconhecimentoVoz(): ReconhecimentoVoz | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => ReconhecimentoVoz;
    webkitSpeechRecognition?: new () => ReconhecimentoVoz;
  };
  const Construtor = w.SpeechRecognition || w.webkitSpeechRecognition;
  if (!Construtor) return null;
  const reconhecimento = new Construtor();
  reconhecimento.lang = "pt-BR";
  reconhecimento.interimResults = false;
  return reconhecimento;
}

export default function PainelTarefasCompras({ itensIniciais }: { itensIniciais: Item[] }) {
  const supabase = createClient();
  const [itens, setItens] = useState(itensIniciais);
  const [processando, setProcessando] = useState<string | null>(null);

  // Input inteligente
  const [textoIa, setTextoIa] = useState("");
  const [enviandoIa, setEnviandoIa] = useState(false);
  const [erroIa, setErroIa] = useState("");
  const [ouvindo, setOuvindo] = useState(false);
  const reconhecimentoRef = useRef<ReconhecimentoVoz | null>(null);
  const [temReconhecimentoVoz, setTemReconhecimentoVoz] = useState(false);

  useEffect(() => {
    setTemReconhecimentoVoz(criarReconhecimentoVoz() !== null);
  }, []);

  // Input manual
  const [formAberto, setFormAberto] = useState<Tipo | null>(null);
  const [texto, setTexto] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [prazo, setPrazo] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroManual, setErroManual] = useState("");

  function abrirFormManual(tipo: Tipo) {
    setFormAberto(tipo);
    setTexto("");
    setQuantidade("");
    setPrazo("");
    setErroManual("");
  }

  async function handleSubmitManual(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!formAberto) return;
    if (!texto.trim()) {
      setErroManual("Escreve alguma coisa.");
      return;
    }

    setSalvando(true);
    const { data, error } = await supabase
      .from("itens_lista")
      .insert({
        tipo: formAberto,
        texto: texto.trim(),
        quantidade: quantidade.trim() || null,
        prazo: prazo ? new Date(prazo).toISOString() : null,
        origem: "manual",
      })
      .select("id, tipo, texto, quantidade, concluido, prazo, prioridade, origem")
      .single();

    if (error || !data) {
      setErroManual("Não consegui salvar. Tenta de novo.");
      setSalvando(false);
      return;
    }

    setItens((atual) => [data as Item, ...atual]);
    setSalvando(false);
    setFormAberto(null);
  }

  async function alternarConcluido(item: Item) {
    setProcessando(item.id);
    const { error } = await supabase
      .from("itens_lista")
      .update({ concluido: !item.concluido })
      .eq("id", item.id);

    if (!error) {
      setItens((atual) =>
        atual.map((i) => (i.id === item.id ? { ...i, concluido: !i.concluido } : i))
      );
    }
    setProcessando(null);
  }

  async function remover(item: Item) {
    setProcessando(item.id);
    const { error } = await supabase.from("itens_lista").delete().eq("id", item.id);
    if (!error) {
      setItens((atual) => atual.filter((i) => i.id !== item.id));
    }
    setProcessando(null);
  }

  async function enviarTextoIa(texto: string) {
    const mensagem = texto.trim();
    if (!mensagem || enviandoIa) return;

    setErroIa("");
    setEnviandoIa(true);

    try {
      const resposta = await fetch("/api/tarefas/extrair", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ texto: mensagem }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErroIa(dados.erro || "Não consegui organizar isso agora.");
        setEnviandoIa(false);
        return;
      }

      const novos = (dados.itens ?? []) as Item[];
      if (novos.length === 0) {
        setErroIa("Não consegui identificar tarefa nem item de compra nessa frase.");
      } else {
        setItens((atual) => [...novos, ...atual]);
        setTextoIa("");
      }
    } catch {
      setErroIa("Não consegui organizar isso agora. Tenta de novo.");
    }
    setEnviandoIa(false);
  }

  function alternarMicrofone() {
    if (ouvindo) {
      reconhecimentoRef.current?.stop();
      return;
    }

    const reconhecimento = criarReconhecimentoVoz();
    if (!reconhecimento) return;

    reconhecimento.onresult = (event) => {
      const transcricao = event.results[0]?.[0]?.transcript;
      if (transcricao) {
        setTextoIa(transcricao);
        enviarTextoIa(transcricao);
      }
    };
    reconhecimento.onerror = () => setOuvindo(false);
    reconhecimento.onend = () => setOuvindo(false);

    reconhecimentoRef.current = reconhecimento;
    setOuvindo(true);
    reconhecimento.start();
  }

  const tarefas = itens.filter((i) => i.tipo === "tarefa");
  const compras = itens.filter((i) => i.tipo === "compra");

  function renderSecao(tipo: Tipo, titulo: string, lista: Item[]) {
    const pendentes = lista.filter((i) => !i.concluido);
    const concluidos = lista.filter((i) => i.concluido);

    return (
      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-tinta">{titulo}</h2>
          {pendentes.length > 0 && <Selo variante="verde">{pendentes.length} pendente(s)</Selo>}
        </div>

        {lista.length === 0 && (
          <p className="text-sm text-tinta-suave">Nada por aqui ainda.</p>
        )}

        {pendentes.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-papel-2/70 p-3">
            <button
              type="button"
              className="flex min-w-0 flex-1 items-center gap-2 text-left"
              disabled={processando === item.id}
              onClick={() => alternarConcluido(item)}
            >
              <span className="h-5 w-5 shrink-0 rounded-full border-2 border-verde" />
              <span className="min-w-0">
                <span className="block truncate font-medium text-tinta">
                  {item.texto}
                  {item.quantidade && <span className="text-tinta-suave"> — {item.quantidade}</span>}
                </span>
                {item.prazo && (
                  <span className="text-xs text-tinta-suave">Prazo: {formatarPrazo(item.prazo)}</span>
                )}
              </span>
            </button>
            <button
              type="button"
              className="shrink-0 px-1 text-xs font-semibold text-terracota-escuro disabled:opacity-50"
              disabled={processando === item.id}
              onClick={() => remover(item)}
            >
              Remover
            </button>
          </div>
        ))}

        {concluidos.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-papel-2 pt-2">
            {concluidos.map((item) => (
              <div key={item.id} className="flex items-center justify-between gap-3 px-1">
                <button
                  type="button"
                  className="flex min-w-0 flex-1 items-center gap-2 text-left"
                  disabled={processando === item.id}
                  onClick={() => alternarConcluido(item)}
                >
                  <span className="h-4 w-4 shrink-0 rounded-full bg-verde" />
                  <span className="truncate text-sm text-tinta-suave line-through">{item.texto}</span>
                </button>
                <button
                  type="button"
                  className="shrink-0 px-1 text-xs text-tinta-suave disabled:opacity-50"
                  disabled={processando === item.id}
                  onClick={() => remover(item)}
                >
                  Remover
                </button>
              </div>
            ))}
          </div>
        )}

        {formAberto === tipo ? (
          <form onSubmit={handleSubmitManual} className="flex flex-col gap-2 border-t border-papel-2 pt-3">
            <Campo
              rotulo={tipo === "tarefa" ? "O que precisa fazer?" : "O que precisa comprar?"}
              type="text"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              required
            />
            {tipo === "compra" ? (
              <Campo
                rotulo="Quantidade (opcional)"
                type="text"
                placeholder="Ex: 2 pacotes"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
              />
            ) : (
              <Campo
                rotulo="Prazo (opcional)"
                type="datetime-local"
                value={prazo}
                onChange={(e) => setPrazo(e.target.value)}
              />
            )}
            {erroManual && <p className="text-sm text-terracota-escuro">{erroManual}</p>}
            <div className="flex gap-2">
              <Botao
                type="button"
                variante="secundario"
                className="flex-1 !py-2 text-sm"
                onClick={() => setFormAberto(null)}
              >
                Cancelar
              </Botao>
              <Botao type="submit" className="flex-1 !py-2 text-sm" disabled={salvando}>
                {salvando ? "Salvando..." : "Salvar"}
              </Botao>
            </div>
          </form>
        ) : (
          <Botao type="button" variante="secundario" onClick={() => abrirFormManual(tipo)}>
            + Adicionar {tipo === "tarefa" ? "tarefa" : "item"}
          </Botao>
        )}
      </Card>
    );
  }

  return (
    <>
      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Digita ou fala, eu organizo</Selo>
        <p className="text-sm text-tinta-suave">
          Ex: &quot;comprar leite, pão e detergente&quot; ou &quot;ligar pro fornecedor amanhã de
          manhã&quot;.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={textoIa}
            onChange={(e) => setTextoIa(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                enviarTextoIa(textoIa);
              }
            }}
            placeholder="Escreve ou toca no microfone..."
            disabled={enviandoIa}
            className="flex-1 rounded-lg border-2 border-papel-2 bg-white px-4 py-2.5 text-sm text-tinta outline-none focus:border-verde"
          />
          {temReconhecimentoVoz && (
            <button
              type="button"
              onClick={alternarMicrofone}
              className={`shrink-0 rounded-lg border-2 px-3 text-lg ${
                ouvindo ? "border-terracota bg-terracota/10" : "border-verde bg-verde/10"
              }`}
              aria-label="Falar"
            >
              🎙️
            </button>
          )}
          <Botao
            type="button"
            className="shrink-0 !px-4"
            disabled={enviandoIa || !textoIa.trim()}
            onClick={() => enviarTextoIa(textoIa)}
          >
            {enviandoIa ? "..." : "Ir"}
          </Botao>
        </div>
        {ouvindo && <p className="text-xs text-terracota-escuro">Ouvindo...</p>}
        {erroIa && <p className="text-sm text-terracota-escuro">{erroIa}</p>}
      </Card>

      {renderSecao("tarefa", "Tarefas", tarefas)}
      {renderSecao("compra", "Compras", compras)}
    </>
  );
}
