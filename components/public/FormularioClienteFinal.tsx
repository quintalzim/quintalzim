"use client";

import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import { normalizarTelefoneCliente } from "@/lib/empresa-clientes";
import { createClient } from "@/lib/supabase/client";
import { mensagemErroAuth } from "@/lib/supabase/erros";

export default function FormularioClienteFinal({
  empresaId,
  slug,
}: {
  empresaId: string;
  slug: string;
}) {
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

    // empresaId vai junto no e-mail só pra referência; quem cria o vínculo de
    // verdade é o FinalizarVinculoCliente, rodando em /b/[slug] depois do login
    // (o nome/telefone viajam no user_metadata pra sobreviver mesmo se o link
    // for aberto em outro dispositivo/navegador).
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/b/${slug}`,
        data: { name: nome.trim(), phone: telefoneNormalizado, empresaId },
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
        Mandamos um link pro teu e-mail. Clica nele pra voltar direto pra cá — sem senha, sem
        enrolação. Prontim ✅
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
