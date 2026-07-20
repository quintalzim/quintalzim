"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import { createClient } from "@/lib/supabase/client";

type Modo = "senha" | "magico";
type Estado = "ocioso" | "enviando" | "erro" | "link-enviado";

export default function EntrarPage() {
  const router = useRouter();
  const supabase = createClient();

  const [modo, setModo] = useState<Modo>("senha");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [estado, setEstado] = useState<Estado>("ocioso");
  const [mensagemErro, setMensagemErro] = useState("");

  async function handleLoginSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setMensagemErro("");

    const { error } = await supabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
      setMensagemErro("E-mail ou senha não conferem. Vamos tentar de novo?");
      setEstado("erro");
      return;
    }

    router.push("/app/inicio");
    router.refresh();
  }

  async function handleMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");
    setMensagemErro("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/app/inicio`,
      },
    });

    if (error) {
      setMensagemErro("Não conseguimos enviar o link agora. Tenta de novo?");
      setEstado("erro");
      return;
    }

    setEstado("link-enviado");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="font-titulo text-2xl font-extrabold text-verde-escuro">
            Quintalzim
          </Link>
          <p className="text-tinta-suave">Bem-vindo de volta. Vamos entrar?</p>
        </div>

        <div className="flex rounded-lg bg-papel-2 p-1">
          <button
            type="button"
            onClick={() => {
              setModo("senha");
              setEstado("ocioso");
            }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              modo === "senha" ? "bg-white text-verde-escuro shadow-sm" : "text-tinta-suave"
            }`}
          >
            E-mail e senha
          </button>
          <button
            type="button"
            onClick={() => {
              setModo("magico");
              setEstado("ocioso");
            }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition-colors ${
              modo === "magico" ? "bg-white text-verde-escuro shadow-sm" : "text-tinta-suave"
            }`}
          >
            Link mágico
          </button>
        </div>

        {modo === "senha" ? (
          <form onSubmit={handleLoginSenha} className="flex flex-col gap-4">
            <Campo
              rotulo="E-mail"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Campo
              rotulo="Senha"
              type="password"
              name="senha"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
            {estado === "erro" && (
              <p className="text-sm text-terracota-escuro">{mensagemErro}</p>
            )}
            <Botao type="submit" disabled={estado === "enviando"}>
              {estado === "enviando" ? "Entrando..." : "Entrar"}
            </Botao>
          </form>
        ) : (
          <form onSubmit={handleMagicLink} className="flex flex-col gap-4">
            <Campo
              rotulo="E-mail"
              type="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {estado === "erro" && (
              <p className="text-sm text-terracota-escuro">{mensagemErro}</p>
            )}
            {estado === "link-enviado" ? (
              <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
                Mandamos um link para o seu e-mail. Prontim ✅
              </p>
            ) : (
              <Botao type="submit" disabled={estado === "enviando"}>
                {estado === "enviando" ? "Enviando..." : "Enviar link mágico"}
              </Botao>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
