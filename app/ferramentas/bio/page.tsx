"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import Card from "@/components/ui/Card";

export default function GeradorDeBioPage() {
  const [negocio, setNegocio] = useState("");
  const [descricao, setDescricao] = useState("");
  const [tom, setTom] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<{ bio: string; legenda: string } | null>(null);
  const [copiado, setCopiado] = useState<"bio" | "legenda" | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    setResultado(null);
    setCarregando(true);
    try {
      const resposta = await fetch("/api/ferramentas/bio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ negocio, descricao, tom: tom || undefined }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || "Não consegui gerar agora.");
        return;
      }
      setResultado({ bio: dados.bio, legenda: dados.legenda });
    } catch {
      setErro("Não consegui gerar agora. Confere sua internet e tenta de novo.");
    } finally {
      setCarregando(false);
    }
  }

  function copiar(texto: string, campo: "bio" | "legenda") {
    navigator.clipboard.writeText(texto).then(() => {
      setCopiado(campo);
      setTimeout(() => setCopiado(null), 2000);
    });
  }

  return (
    <div className="flex flex-1 justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div>
          <Link href="/ferramentas" className="font-titulo text-sm font-semibold text-verde-escuro">
            ← Ferramentas
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-tinta">Bio e legenda</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            Conta o que teu negócio faz — a IA escreve uma bio pro Instagram/WhatsApp Business e
            uma legenda pronta pra um post.
          </p>
        </div>

        <Card className="flex flex-col gap-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Campo
              rotulo="Nome do negócio"
              value={negocio}
              onChange={(e) => setNegocio(e.target.value)}
              placeholder="Barbearia do Zé"
              required
            />
            <Campo
              rotulo="O que ele faz"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Corte de cabelo e barba, atendimento rápido, bairro Centro"
              required
            />
            <Campo
              rotulo="Tom desejado (opcional)"
              value={tom}
              onChange={(e) => setTom(e.target.value)}
              placeholder="Descontraído, profissional, elegante..."
            />
            {erro && <p className="text-sm text-terracota-escuro">{erro}</p>}
            <Botao type="submit" disabled={carregando}>
              {carregando ? "Gerando..." : "Gerar bio e legenda"}
            </Botao>
          </form>
        </Card>

        {resultado && (
          <>
            <Card className="flex flex-col gap-2">
              <p className="font-titulo text-sm font-bold text-tinta">Bio</p>
              <p className="text-sm text-tinta">{resultado.bio}</p>
              <button
                type="button"
                onClick={() => copiar(resultado.bio, "bio")}
                className="mt-1 self-start font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
              >
                {copiado === "bio" ? "Copiado!" : "Copiar bio"}
              </button>
            </Card>
            <Card className="flex flex-col gap-2">
              <p className="font-titulo text-sm font-bold text-tinta">Legenda</p>
              <p className="whitespace-pre-line text-sm text-tinta">{resultado.legenda}</p>
              <button
                type="button"
                onClick={() => copiar(resultado.legenda, "legenda")}
                className="mt-1 self-start font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
              >
                {copiado === "legenda" ? "Copiado!" : "Copiar legenda"}
              </button>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
