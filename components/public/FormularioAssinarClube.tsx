"use client";

import { useState } from "react";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/client";

type Plano = {
  id: string;
  nome: string;
  descricao: string | null;
  valor: number | null;
};

function formatarReais(valor: number | null): string {
  if (valor === null) return "Sob consulta";
  return `${valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}/mês`;
}

export default function FormularioAssinarClube({
  empresaId,
  empresaNome,
  ownerId,
  planos,
}: {
  empresaId: string;
  empresaNome: string;
  ownerId: string | null;
  planos: Plano[];
}) {
  const supabase = createClient();
  const [selecionado, setSelecionado] = useState<Plano | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [enviado, setEnviado] = useState<string | null>(null);

  if (planos.length === 0) return null;

  async function handlePedir(plano: Plano) {
    setSelecionado(plano);
    setMensagemErro("");
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

    const { error } = await supabase.from("assinaturas_clube").insert({
      empresa_id: empresaId,
      plano_id: plano.id,
      cliente_profile_id: user.id,
      nome_plano: plano.nome,
      valor_plano: plano.valor,
      nome_cliente: nomeCliente,
      telefone_cliente: perfil?.phone ?? null,
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
          titulo: `Novo pedido de assinatura — ${empresaNome}`,
          corpo: `${nomeCliente || "Alguém"} quer entrar no plano ${plano.nome}. Confirma no painel.`,
          url: "/app/empresa",
        }),
      }).catch(() => {});
    }

    setEnviado(plano.nome);
    setCarregando(false);
  }

  if (enviado) {
    return (
      <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
        Pedido pro plano {enviado} enviado! {empresaNome} combina o pagamento e confirma. Prontim ✅
      </p>
    );
  }

  return (
    <Card className="flex flex-col gap-3">
      <Selo variante="verde">Clube de Assinaturas</Selo>
      <div className="flex flex-col gap-2">
        {planos.map((plano) => (
          <div
            key={plano.id}
            className="flex items-center justify-between gap-3 rounded-lg border-2 border-papel-2 bg-white/60 p-3"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-tinta">{plano.nome}</p>
              {plano.descricao && (
                <p className="truncate text-xs text-tinta-suave">{plano.descricao}</p>
              )}
              <p className="text-sm font-bold text-verde-escuro">{formatarReais(plano.valor)}</p>
            </div>
            <Botao
              type="button"
              variante="secundario"
              className="shrink-0 !px-3 !py-2 text-xs"
              disabled={carregando}
              onClick={() => handlePedir(plano)}
            >
              {carregando && selecionado?.id === plano.id ? "Enviando..." : "Quero assinar"}
            </Botao>
          </div>
        ))}
      </div>
      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
    </Card>
  );
}
