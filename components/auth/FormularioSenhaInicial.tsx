"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import CampoSenha from "@/components/ui/CampoSenha";
import { createClient } from "@/lib/supabase/client";
import { mensagemErroAuth } from "@/lib/supabase/erros";

// Tela de boas-vindas pra quem entrou pela primeira vez via link mágico
// (originado de captura de lead, ex: quiz). Diferente de FormularioNovaSenha
// (recuperação de senha esquecida), aqui criar senha é opcional — a pessoa
// pode continuar só com link mágico e pular direto pro Início.
export default function FormularioSenhaInicial() {
  const router = useRouter();
  const supabase = createClient();

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  function irParaInicio() {
    router.push("/app/inicio");
    router.refresh();
  }

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
    setTimeout(irParaInicio, 1200);
  }

  if (sucesso) {
    return (
      <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
        Senha criada! Prontim ✅
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <CampoSenha
        rotulo="Cria uma senha"
        name="senha"
        required
        minLength={8}
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
      />
      <CampoSenha
        rotulo="Confirma a senha"
        name="confirmarSenha"
        required
        minLength={8}
        value={confirmarSenha}
        onChange={(e) => setConfirmarSenha(e.target.value)}
      />
      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
      <Botao type="submit" disabled={carregando}>
        {carregando ? "Salvando..." : "Criar senha e entrar"}
      </Botao>
      <button
        type="button"
        onClick={irParaInicio}
        className="text-center text-sm font-semibold text-verde-escuro underline-offset-2 hover:underline"
      >
        Pular por agora, uso o link mágico da próxima vez
      </button>
    </form>
  );
}
