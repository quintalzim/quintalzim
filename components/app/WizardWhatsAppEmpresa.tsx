"use client";

import { useState } from "react";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

type Empresa = {
  id: string;
  nome: string;
  whatsapp_status: string | null;
};

export default function WizardWhatsAppEmpresa({ empresa }: { empresa: Empresa }) {
  const [temWhatsAppBusiness, setTemWhatsAppBusiness] = useState<"sim" | "nao" | null>(null);

  const jaConectado = empresa.whatsapp_status === "conectado";

  if (jaConectado) {
    return (
      <Card className="flex flex-col gap-2">
        <Selo variante="verde">WhatsApp conectado</Selo>
        <p className="text-sm text-tinta-suave">
          O Recepcionista já está respondendo pelo número da tua Empresa. Prontim ✅
        </p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-tinta">WhatsApp da Empresa</h2>
        <Selo variante="terracota">Em preparação</Selo>
      </div>

      <p className="text-sm text-tinta-suave">
        Em breve o Recepcionista vai responder direto no número de WhatsApp que{" "}
        <strong>{empresa.nome}</strong> já usa — sem trocar de número e sem perder o histórico.
        Nada muda pro dono até você ativar.
      </p>

      <div className="flex flex-col gap-2">
        <p className="font-titulo text-sm font-semibold text-tinta">
          Passo 1 — Vocês já usam o WhatsApp Business (o app verde escrito &quot;Business&quot;)?
        </p>
        <div className="flex gap-2">
          <Botao
            type="button"
            variante={temWhatsAppBusiness === "sim" ? "primario" : "secundario"}
            className="flex-1 !py-2 text-sm"
            onClick={() => setTemWhatsAppBusiness("sim")}
          >
            Já uso
          </Botao>
          <Botao
            type="button"
            variante={temWhatsAppBusiness === "nao" ? "primario" : "secundario"}
            className="flex-1 !py-2 text-sm"
            onClick={() => setTemWhatsAppBusiness("nao")}
          >
            Ainda não
          </Botao>
        </div>

        {temWhatsAppBusiness === "nao" && (
          <p className="rounded-lg bg-amarelo/20 px-4 py-3 text-sm text-tinta">
            Sem problema: baixa o <strong>WhatsApp Business</strong> (grátis, na loja de app do teu
            celular) e migra o número que você já usa — leva minutos e mantém as conversas.
            Volta aqui depois de migrar.
          </p>
        )}

        {temWhatsAppBusiness === "sim" && (
          <p className="rounded-lg bg-verde/10 px-4 py-3 text-sm text-verde-escuro">
            Show, já está no caminho certo. Falta só a etapa 2.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-2 border-t border-papel-2 pt-4">
        <p className="font-titulo text-sm font-semibold text-tinta">
          Passo 2 — Ativar o Recepcionista no seu número
        </p>
        <p className="text-sm text-tinta-suave">
          Essa etapa depende de uma liberação da Meta (dona do WhatsApp) que o Quintalzim está
          finalizando. Assim que sair, esse botão libera e você ativa com um clique — sem digitar
          senha aqui dentro.
        </p>
        <Botao type="button" disabled title="Aguardando liberação da Meta">
          Ativar via Meta (em breve)
        </Botao>
      </div>
    </Card>
  );
}
