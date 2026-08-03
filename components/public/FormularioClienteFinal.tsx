"use client";

import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import { CHAVE_CADASTRO_PENDENTE, normalizarTelefoneCliente } from "@/lib/empresa-clientes";
import { createClient } from "@/lib/supabase/client";
import { mensagemErroAuth } from "@/lib/supabase/erros";

export default function FormularioClienteFinal({ empresaId }: { empresaId: string }) {
  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [email, setEmail] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemErro("");

    const telefoneNormalizado = normalizarTelefoneCliente(telefone);

    if (!nome.trim() || !telefoneNormalizado || !email.trim()) {
      setMensagemErro("Preenche nome, telefone (com DDD) e e-mail pra continuar.");
      return;
    }

    setCarregando(true);

    try {
      window.localStorage.setItem(
        CHAVE_CADASTRO_PENDENTE,
        JSON.stringify({ empresaId, nome: nome.trim(), telefone: telefoneNormalizado })
      );
    } catch {
      // localStorage indisponível (modo privado etc.) — segue sem bloquear o cadastro
    }

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/app/inicio`,
        data: { name: nome.trim() },
      },
    });

    if (error) {
      setMensagemErro(mensagemErroAuth(error));
      setCarregando(false);
      return;
    }

    setEnviado(true);
    setCarregando(false);
  }

  if (enviado) {
    return (
      <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
        Mandamos um link pro teu e-mail. Clica nele pra confirmar — sem senha, sem enrolação.
        Prontim ✅
      </p>
    );
  }

  return (
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
        rotulo="WhatsApp"
        name="telefone"
        type="tel"
        placeholder="(35) 99999-9999"
        required
        value={telefone}
        onChange={(e) => setTelefone(e.target.value)}
      />
      <Campo
        rotulo="E-mail"
        name="email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
      <Botao type="submit" disabled={carregando}>
        {carregando ? "Enviando..." : "Quero receber avisos"}
      </Botao>
    </form>
  );
}
