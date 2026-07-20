"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import CampoSenha from "@/components/ui/CampoSenha";
import { createClient } from "@/lib/supabase/client";
import { mensagemErroAuth } from "@/lib/supabase/erros";

export default function FormularioNovaSenha() {
  const router = useRouter();
  const supabase = createClient();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemErro("");

    if (senha.length < 8) {
      setMensagemErro("Sua senha precisa de pelo menos 8 caracteres.");
      return;
    }

    if (senha !== confirmarSenha) {
      setMensagemErro("As senhas digitadas são diferentes. Confere de novo?");
      return;
    }

    setCarregando(true);
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setMensagemErro(mensagemErroAuth(error));
      setCarregando(false);
      return;
    }

    setSucesso(true);
    setCarregando(false);
    setTimeout(() => {
      router.push("/app/inicio");
      router.refresh();
    }, 1500);
  }

  if (sucesso) {
    return (
      <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
        Senha nova salva! Te levando pro seu quintal... 🌱
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <CampoSenha
        rotulo="Nova senha"
        name="senha"
        required
        minLength={8}
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <CampoSenha
        rotulo="Confirma a senha nova"
        name="confirmarSenha"
        required
        minLength={8}
        value={confirmarSenha}
        onChange={(e) => setConfirmarSenha(e.target.value)}
      />
      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
      <Botao type="submit" disabled={carregando}>
        {carregando ? "Salvando..." : "Salvar nova senha"}
      </Botao>
    </form>
  );
}
