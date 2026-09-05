"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Botao from "@/components/ui/Botao";

type Mensagem = {
  id: string;
  autor: "usuario" | "prontim";
  texto: string;
};

function Balao({ mensagem }: { mensagem: Mensagem }) {
  const deVoce = mensagem.autor === "usuario";
  return (
    <div className={`flex ${deVoce ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm shadow-[var(--shadow-quintal-sm)] ${
          deVoce ? "rounded-tr-sm bg-verde text-papel" : "rounded-tl-sm bg-white text-tinta"
        }`}
      >
        {mensagem.texto}
      </div>
    </div>
  );
}

export default function PainelChatProntim({
  historicoInicial,
}: {
  historicoInicial: Mensagem[];
}) {
  const [mensagens, setMensagens] = useState<Mensagem[]>(historicoInicial);
  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const fimRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  async function enviar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const mensagem = texto.trim();
    if (!mensagem || enviando) return;

    setErro("");
    setTexto("");
    setEnviando(true);
    setMensagens((atual) => [...atual, { id: `local-${Date.now()}`, autor: "usuario", texto: mensagem }]);

    try {
      const resposta = await fetch("/api/prontim/mensagem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mensagem }),
      });
      const dados = await resposta.json();

      if (!resposta.ok) {
        setErro(dados.erro || "Não consegui responder agora.");
        setEnviando(false);
        return;
      }

      setMensagens((atual) => [
        ...atual,
        { id: `local-${Date.now()}-r`, autor: "prontim", texto: dados.resposta },
      ]);
    } catch {
      setErro("Não consegui responder agora. Tenta de novo.");
    }
    setEnviando(false);
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-h-[60vh] min-h-[40vh] flex-col gap-2.5 overflow-y-auto rounded-2xl bg-papel-2 p-4">
        {mensagens.length === 0 ? (
          <p className="m-auto text-center text-sm text-tinta-suave">
            Manda um oi pro Prontim — pergunta qualquer coisa sobre o Quintalzim.
          </p>
        ) : (
          mensagens.map((m) => <Balao key={m.id} mensagem={m} />)
        )}
        {enviando && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-tl-sm bg-white px-4 py-2.5 text-sm text-tinta-suave shadow-[var(--shadow-quintal-sm)]">
              digitando...
            </div>
          </div>
        )}
        <div ref={fimRef} />
      </div>

      {erro && <p className="text-sm text-terracota-escuro">{erro}</p>}

      <form onSubmit={enviar} className="flex gap-2">
        <input
          type="text"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder="Escreve aqui..."
          disabled={enviando}
          className="flex-1 rounded-lg border-2 border-papel-2 bg-white px-4 py-2.5 text-sm text-tinta outline-none focus:border-verde"
        />
        <Botao type="submit" disabled={enviando || !texto.trim()} className="px-5">
          Enviar
        </Botao>
      </form>
    </div>
  );
}
