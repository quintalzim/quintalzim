"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, Suspense, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import CampoSenha from "@/components/ui/CampoSenha";
import { createClient } from "@/lib/supabase/client";
import { mensagemErroAuth } from "@/lib/supabase/erros";

type Aba = "entrar" | "criar";
type Modo = "padrao" | "magico" | "recuperar";
type Resultado = "cadastro-confirmar" | "magico-enviado" | "recuperacao-enviada" | null;

function EntrarConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const avisoLinkInvalido = searchParams.get("erro") === "link-invalido";

  const [aba, setAba] = useState<Aba>("entrar");
  const [modo, setModo] = useState<Modo>("padrao");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [resultado, setResultado] = useState<Resultado>(null);

  function trocarAba(novaAba: Aba) {
    setAba(novaAba);
    setModo("padrao");
    setSenha("");
    setMensagemErro("");
    setResultado(null);
  }

  function trocarModo(novoModo: Modo) {
    setModo(novoModo);
    setMensagemErro("");
    setResultado(null);
  }

  async function handleEntrarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCarregando(true);
    setMensagemErro("");

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setMensagemErro(mensagemErroAuth(error));
      setCarregando(false);
      return;
    }

    router.push("/app/inicio");
    router.refresh();
  }

  async function handleCriarConta(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCarregando(true);
    setMensagemErro("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: { name: nome },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/app/inicio`,
      },
    });

    if (error) {
      setMensagemErro(mensagemErroAuth(error));
      setCarregando(false);
      return;
    }

    if (data.user && data.user.identities && data.user.identities.length === 0) {
      setMensagemErro("Esse e-mail já tem portão aqui. Quer entrar?");
      setCarregando(false);
      return;
    }

    setResultado("cadastro-confirmar");
    setCarregando(false);
  }

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCarregando(true);
    setMensagemErro("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/app/inicio`,
      },
    });

    if (error) {
      setMensagemErro(mensagemErroAuth(error));
      setCarregando(false);
      return;
    }

    setResultado("magico-enviado");
    setCarregando(false);
  }

  async function handleRecuperar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCarregando(true);
    setMensagemErro("");

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/redefinir-senha`,
    });

    if (error) {
      setMensagemErro(mensagemErroAuth(error));
      setCarregando(false);
      return;
    }

    setResultado("recuperacao-enviada");
    setCarregando(false);
  }

  const linkAlternancia =
    "text-sm font-semibold text-verde-escuro underline-offset-2 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde rounded";

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="font-titulo text-2xl font-extrabold text-verde-escuro">
            Quintalzim
          </Link>
          <p className="text-tinta-suave">Bem-vindo de volta. Vamos entrar?</p>
        </div>

        {avisoLinkInvalido && (
          <p className="rounded-lg bg-terracota/10 px-4 py-3 text-center text-sm font-semibold text-terracota-escuro">
            Esse link venceu ou já foi usado. Pede outro que a gente manda na hora.
          </p>
        )}

        <div className="flex rounded-lg bg-papel-2 p-1">
          <button
            type="button"
            onClick={() => trocarAba("entrar")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              aba === "entrar" ? "bg-white text-verde-escuro shadow-sm" : "text-tinta-suave"
            }`}
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => trocarAba("criar")}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              aba === "criar" ? "bg-white text-verde-escuro shadow-sm" : "text-tinta-suave"
            }`}
          >
            Criar conta
          </button>
        </div>

        {resultado === "cadastro-confirmar" && (
          <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
            Confirma teu e-mail 📬 — te mandamos um link. Dá uma olhada na caixa de entrada (e no
            spam, que às vezes ele se esconde lá).
          </p>
        )}

        {resultado === "magico-enviado" && (
          <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
            Mandamos um link mágico pro seu e-mail. Clica nele pra entrar. Prontim ✅
          </p>
        )}

        {resultado === "recuperacao-enviada" && (
          <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
            Se esse e-mail tiver portão aqui, mandamos um link pra você criar uma senha nova.
            Confere a caixa de entrada (e o spam).
          </p>
        )}

        {resultado === null && modo === "recuperar" && (
          <form onSubmit={handleRecuperar} className="flex flex-col gap-4">
            <p className="text-sm text-tinta-suave">
              Digite seu e-mail e a gente manda um link pra você escolher uma senha nova.
            </p>
            <Campo
              rotulo="E-mail"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
            <Botao type="submit" disabled={carregando}>
              {carregando ? "Enviando..." : "Mandar link de recuperação"}
            </Botao>
            <button
              type="button"
              onClick={() => trocarModo("padrao")}
              className={`${linkAlternancia} text-center`}
            >
              Voltar
            </button>
          </form>
        )}

        {resultado === null && modo === "magico" && (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
            <Campo
              rotulo="E-mail"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
            <Botao type="submit" disabled={carregando}>
              {carregando ? "Enviando..." : "Me manda um link mágico"}
            </Botao>
            <button
              type="button"
              onClick={() => trocarModo("padrao")}
              className={`${linkAlternancia} text-center`}
            >
              Voltar
            </button>
          </form>
        )}

        {resultado === null && modo === "padrao" && aba === "entrar" && (
          <form onSubmit={handleEntrarSenha} className="flex flex-col gap-4">
            <Campo
              rotulo="E-mail"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <CampoSenha
              rotulo="Senha"
              name="senha"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            <button
              type="button"
              onClick={() => trocarModo("recuperar")}
              className={`${linkAlternancia} self-end`}
            >
              Esqueci minha senha
            </button>
            {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
            <Botao type="submit" disabled={carregando}>
              {carregando ? "Entrando..." : "Entrar no quintal"}
            </Botao>
            <button
              type="button"
              onClick={() => trocarModo("magico")}
              className={`${linkAlternancia} text-center`}
            >
              ou entra sem senha
            </button>
          </form>
        )}

        {resultado === null && modo === "padrao" && aba === "criar" && (
          <form onSubmit={handleCriarConta} className="flex flex-col gap-4">
            <Campo
              rotulo="Nome"
              type="text"
              name="nome"
              required
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
            <Campo
              rotulo="E-mail"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <CampoSenha
              rotulo="Senha"
              name="senha"
              required
              minLength={8}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
            <Botao type="submit" disabled={carregando}>
              {carregando ? "Abrindo o portão..." : "Abrir meu portão"}
            </Botao>
            <button
              type="button"
              onClick={() => trocarModo("magico")}
              className={`${linkAlternancia} text-center`}
            >
              ou entra sem senha
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function EntrarPage() {
  return (
    <Suspense>
      <EntrarConteudo />
    </Suspense>
  );
}
