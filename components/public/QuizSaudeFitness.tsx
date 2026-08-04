"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { quizSaudeFitness } from "@/lib/quiz/saude-fitness";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

const NOMES_PLANO: Record<string, string> = {
  pf_base: "PF Base",
  pf_premium: "PF Premium",
};

export default function QuizSaudeFitness() {
  const perguntas = quizSaudeFitness.perguntas;
  const total = perguntas.length;

  const [passo, setPasso] = useState(0);
  const [respostas, setRespostas] = useState<Record<string, string>>({});
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  const [resultado, setResultado] = useState<{
    diagnostico: string;
    planoSugerido: string | null;
    plano: string[];
  } | null>(null);

  function escolherOpcao(perguntaId: string, valor: string) {
    const novasRespostas = { ...respostas, [perguntaId]: valor };
    setRespostas(novasRespostas);

    if (passo < total - 1) {
      setPasso(passo + 1);
    } else {
      setMostrarFormulario(true);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemErro("");

    if (!nome.trim() || !email.trim()) {
      setMensagemErro("Preenche nome e e-mail pra ver teu diagnóstico.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await fetch("/api/quiz/diagnostico", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quiz: quizSaudeFitness.id,
          nome: nome.trim(),
          email: email.trim(),
          whatsapp: whatsapp.trim() || null,
          respostas,
        }),
      });

      if (!resposta.ok) {
        setMensagemErro("Não consegui montar teu diagnóstico agora. Tenta de novo em instantes.");
        setCarregando(false);
        return;
      }

      const dados = await resposta.json();
      setResultado({
        diagnostico: dados.diagnostico,
        planoSugerido: dados.planoSugerido,
        plano: Array.isArray(dados.plano) ? dados.plano : [],
      });
    } catch {
      setMensagemErro("Não consegui montar teu diagnóstico agora. Tenta de novo em instantes.");
    } finally {
      setCarregando(false);
    }
  }

  if (resultado) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <Selo variante="verde">Teu diagnóstico</Selo>
          <h1 className="font-titulo text-2xl font-extrabold text-tinta">
            Prontim montou isso pra ti
          </h1>
        </div>
        <Card className="flex flex-col gap-3">
          <p className="whitespace-pre-wrap text-sm text-tinta">{resultado.diagnostico}</p>
        </Card>
        {resultado.plano.length > 0 && (
          <Card className="flex flex-col gap-3">
            <p className="font-titulo text-sm font-bold text-tinta">Teu plano pra começar</p>
            <ul className="flex flex-col gap-2">
              {resultado.plano.map((habito, indice) => (
                <li key={indice} className="flex gap-2 text-sm text-tinta">
                  <span className="text-verde-escuro">✓</span>
                  <span>{habito}</span>
                </li>
              ))}
            </ul>
            <p className="text-xs text-tinta-suave">
              Cria tua conta com o mesmo e-mail que você usou aqui pra ver esse plano guardado no
              teu Início.
            </p>
          </Card>
        )}
        <Card className="flex flex-col gap-3 text-center">
          <p className="text-sm text-tinta-suave">
            {resultado.planoSugerido && NOMES_PLANO[resultado.planoSugerido]
              ? `Pelo que você respondeu, o plano ${NOMES_PLANO[resultado.planoSugerido]} é o que mais combina contigo.`
              : "Dá uma olhada no Quintalzim pra continuar a partir daqui."}
          </p>
          <Link href="/entrar">
            <Botao type="button" className="w-full">
              Conhecer o Quintalzim
            </Botao>
          </Link>
        </Card>
      </div>
    );
  }

  if (mostrarFormulario) {
    return (
      <div className="flex w-full max-w-sm flex-col gap-5">
        <div className="flex flex-col items-center gap-2 text-center">
          <Selo variante="verde">Quase lá</Selo>
          <h1 className="font-titulo text-2xl font-extrabold text-tinta">
            Deixa teu contato pra ver o diagnóstico
          </h1>
          <p className="text-tinta-suave">O Prontim já tem tudo que precisa das tuas respostas.</p>
        </div>
        <Card>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Campo
              rotulo="Seu nome"
              name="nome"
              type="text"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <Campo
              rotulo="E-mail"
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Campo
              rotulo="WhatsApp (opcional)"
              name="whatsapp"
              type="tel"
              placeholder="(35) 99999-9999"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
            />
            {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
            <Botao type="submit" disabled={carregando}>
              {carregando ? "Montando teu diagnóstico..." : "Ver meu diagnóstico"}
            </Botao>
          </form>
        </Card>
      </div>
    );
  }

  const pergunta = perguntas[passo];

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-2 w-full overflow-hidden rounded-full bg-papel-2">
          <div
            className="h-full rounded-full bg-verde transition-all duration-300"
            style={{ width: `${((passo + 1) / total) * 100}%` }}
          />
        </div>
        <p className="text-center text-xs font-semibold text-tinta-suave">
          {passo + 1} de {total}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="font-titulo text-xl font-extrabold text-tinta">{pergunta.pergunta}</h1>
      </div>

      <div className="flex flex-col gap-3">
        {pergunta.opcoes.map((opcao) => (
          <button
            key={opcao.valor}
            type="button"
            onClick={() => escolherOpcao(pergunta.id, opcao.valor)}
            className="rounded-lg border-2 border-papel-2 bg-white px-5 py-4 text-left font-titulo text-base font-semibold text-tinta transition-colors hover:border-verde"
          >
            {opcao.rotulo}
          </button>
        ))}
      </div>
    </div>
  );
}
