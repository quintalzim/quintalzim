"use client";

import { useEffect, useState } from "react";
import Botao from "@/components/ui/Botao";
import {
  ativarNotificacoes,
  desativarNotificacoes,
  statusAtualNotificacoes,
  type StatusNotificacoes,
} from "@/lib/push";
import { createClient } from "@/lib/supabase/client";

export default function AtivarNotificacoes() {
  const [status, setStatus] = useState<StatusNotificacoes | "carregando">("carregando");
  const [mensagemErro, setMensagemErro] = useState("");
  const [enviandoTeste, setEnviandoTeste] = useState(false);
  const [mensagemTeste, setMensagemTeste] = useState("");

  useEffect(() => {
    statusAtualNotificacoes().then(setStatus);
  }, []);

  async function handleAtivar() {
    setMensagemErro("");
    const resultado = await ativarNotificacoes();
    if (!resultado.ok) {
      setMensagemErro(resultado.erro || "Não consegui ativar. Tenta de novo.");
      setStatus(await statusAtualNotificacoes());
      return;
    }
    setStatus("ativo");
  }

  async function handleDesativar() {
    await desativarNotificacoes();
    setStatus("inativo");
  }

  async function handleTeste() {
    setEnviandoTeste(true);
    setMensagemTeste("");

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMensagemTeste("Sessão expirada.");
      setEnviandoTeste(false);
      return;
    }

    const resposta = await fetch("/api/push/enviar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profileId: user.id,
        titulo: "Prontim ✅",
        corpo: "Suas notificações estão funcionando!",
      }),
    });

    setMensagemTeste(
      resposta.ok ? "Mandado! Confere se chegou." : "Não consegui mandar o teste agora."
    );
    setEnviandoTeste(false);
  }

  if (status === "carregando") return null;

  if (status === "sem-suporte") {
    return (
      <p className="text-sm text-tinta-suave">
        Esse navegador não suporta notificações. Tenta pelo Chrome ou Safari mais recente.
      </p>
    );
  }

  if (status === "negado") {
    return (
      <p className="text-sm text-tinta-suave">
        As notificações estão bloqueadas nas configurações do navegador. Libera lá pra poder
        ativar por aqui.
      </p>
    );
  }

  if (status === "ativo") {
    return (
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold text-verde-escuro">Notificações ativas ✅</p>
        <div className="flex gap-2">
          <Botao type="button" variante="secundario" className="flex-1 !py-2 text-sm" onClick={handleTeste} disabled={enviandoTeste}>
            {enviandoTeste ? "Mandando..." : "Mandar teste"}
          </Botao>
          <Botao type="button" variante="secundario" className="flex-1 !py-2 text-sm" onClick={handleDesativar}>
            Desativar
          </Botao>
        </div>
        {mensagemTeste && <p className="text-sm text-tinta-suave">{mensagemTeste}</p>}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <Botao type="button" onClick={handleAtivar}>
        Ativar avisos no navegador
      </Botao>
      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
    </div>
  );
}
