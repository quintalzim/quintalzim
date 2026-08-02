"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import { createClient } from "@/lib/supabase/client";

function gerarSlug(nome: string): string {
  const base = nome
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const sufixo = Math.random().toString(36).slice(2, 6);
  return base ? `${base}-${sufixo}` : sufixo;
}

export default function FormularioCriarEmpresa() {
  const router = useRouter();
  const supabase = createClient();

  const [nome, setNome] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemErro("");

    if (!nome.trim()) {
      setMensagemErro("Conta pro Prontim o nome do teu negócio.");
      return;
    }

    setCarregando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMensagemErro("Sessão expirada. Entre novamente.");
      setCarregando(false);
      return;
    }

    const { error } = await supabase.from("empresas").insert({
      owner_id: user.id,
      nome: nome.trim(),
      slug: gerarSlug(nome),
    });

    if (error) {
      setMensagemErro("Não consegui cadastrar. Tenta de novo em instantes.");
      setCarregando(false);
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Campo
        rotulo="Nome do negócio"
        name="nome"
        type="text"
        placeholder="Ex: Barbearia do Zé"
        required
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
      <Botao type="submit" disabled={carregando}>
        {carregando ? "Cadastrando..." : "Cadastrar minha Empresa"}
      </Botao>
    </form>
  );
}
