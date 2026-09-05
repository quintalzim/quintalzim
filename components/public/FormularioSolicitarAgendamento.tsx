"use client";

import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import { createClient } from "@/lib/supabase/client";

export default function FormularioSolicitarAgendamento({
  empresaId,
  empresaNome,
  ownerId,
}: {
  empresaId: string;
  empresaNome: string;
  ownerId: string | null;
}) {
  const supabase = createClient();

  const [servico, setServico] = useState("");
  const [dataHora, setDataHora] = useState("");
  const [observacao, setObservacao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemErro("");

    if (!servico.trim() || !dataHora) {
      setMensagemErro("Conta o que você precisa e o horário que prefere.");
      return;
    }

    setCarregando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMensagemErro("Sessão expirada. Recarrega a página e tenta de novo.");
      setCarregando(false);
      return;
    }

    const { data: perfil } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .maybeSingle();

    const nomeCliente = (user.user_metadata?.name as string | undefined)?.trim() || "";

    await supabase.from("empresa_clientes").upsert(
      {
        empresa_id: empresaId,
        profile_id: user.id,
        nome: nomeCliente,
        telefone: perfil?.phone ?? null,
      },
      { onConflict: "empresa_id,profile_id" }
    );

    const { error } = await supabase.from("agendamentos").insert({
      empresa_id: empresaId,
      cliente_profile_id: user.id,
      nome_cliente: nomeCliente,
      telefone_cliente: perfil?.phone ?? null,
      servico: servico.trim(),
      data_hora_desejada: new Date(dataHora).toISOString(),
      observacao: observacao.trim() || null,
      status: "pendente",
    });

    if (error) {
      setMensagemErro("Não consegui enviar o pedido. Tenta de novo em instantes.");
      setCarregando(false);
      return;
    }

    if (ownerId) {
      fetch("/api/push/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: ownerId,
          empresaId,
          titulo: `Novo pedido de horário — ${empresaNome}`,
          corpo: `${nomeCliente || "Alguém"} quer ${servico.trim()}. Confirma no painel.`,
          url: "/app/empresa",
        }),
      }).catch(() => {});
    }

    setEnviado(true);
    setCarregando(false);
  }

  if (enviado) {
    return (
      <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
        Pedido enviado! Avisamos assim que {empresaNome} confirmar. Prontim ✅
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Campo
        rotulo="O que você precisa?"
        name="servico"
        type="text"
        placeholder="Ex: Corte de cabelo"
        required
        value={servico}
        onChange={(e) => setServico(e.target.value)}
      />
      <Campo
        rotulo="Data e horário preferido"
        name="dataHora"
        type="datetime-local"
        required
        value={dataHora}
        onChange={(e) => setDataHora(e.target.value)}
      />
      <Campo
        rotulo="Alguma observação? (opcional)"
        name="observacao"
        type="text"
        placeholder="Ex: prefiro à tarde"
        value={observacao}
        onChange={(e) => setObservacao(e.target.value)}
      />
      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
      <Botao type="submit" disabled={carregando}>
        {carregando ? "Enviando..." : "Pedir horário"}
      </Botao>
    </form>
  );
}
