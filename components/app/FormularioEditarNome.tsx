"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import { createClient } from "@/lib/supabase/client";
import { mensagemErroAuth } from "@/lib/supabase/erros";

export default function FormularioEditarNome({ nomeAtual }: { nomeAtual: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [nome, setNome] = useState(nomeAtual);
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemErro("");
    setSucesso(false);

    const nomeAparado = nome.trim();
    if (!nomeAparado) {
      setMensagemErro("Seu nome não pode ficar em branco.");
      return;
    }

    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ data: { name: nomeAparado } });

    if (error) {
      setMensagemErro(mensagemErroAuth(error));
      setCarregando(false);
      return;
    }

    setSucesso(true);
    setCarregando(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Campo
        rotulo="Nome"
        name="nome"
        required
        value={nome}
        onChange={(e) => {
          setNome(e.target.value);
          setSucesso(false);
        }}
      />
      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
      {sucesso && (
        <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
          Prontim ✅ Nome atualizado
        </p>
      )}
      <Botao type="submit" disabled={carregando}>
        {carregando ? "Salvando..." : "Salvar nome"}
      </Botao>
    </form>
  );
}
