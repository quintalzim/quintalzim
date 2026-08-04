"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import CampoSenha from "@/components/ui/CampoSenha";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";
import { mensagemErroAuth } from "@/lib/supabase/erros";

export default function DesbloquearPortalCompleto() {
  const router = useRouter();
  const [mostrarForm, setMostrarForm] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

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
    const supabase = createClient();

    const { error: erroSenha } = await supabase.auth.updateUser({ password: senha });
    if (erroSenha) {
      setMensagemErro(mensagemErroAuth(erroSenha));
      setCarregando(false);
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("profiles").update({ acesso_portal: "completo" }).eq("id", user.id);
    }

    setCarregando(false);
    router.refresh();
  }

  return (
    <Card className="flex flex-col gap-3">
      <p className="font-titulo text-lg font-bold text-tinta">Conhecer o Quintalzim</p>
      <p className="text-sm text-tinta-suave">
        Você está vendo só os seus pedidos por enquanto. Se quiser conhecer o resto do portal
        (finanças, Prontim, catálogo e mais), cria uma senha e libera o acesso completo — sem
        perder o que já está aqui.
      </p>

      {!mostrarForm && (
        <Botao type="button" variante="secundario" onClick={() => setMostrarForm(true)}>
          Quero conhecer o Quintalzim
        </Botao>
      )}

      {mostrarForm && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            {carregando ? "Liberando..." : "Liberar acesso completo"}
          </Botao>
        </form>
      )}
    </Card>
  );
}
