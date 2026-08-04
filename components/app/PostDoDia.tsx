"use client";

import { useState } from "react";
import Botao from "@/components/ui/Botao";

function formatarData(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  } catch {
    return iso;
  }
}

export default function PostDoDia({
  conteudo,
  criadoEm,
}: {
  conteudo: string | null;
  criadoEm: string | null;
}) {
  const [copiado, setCopiado] = useState(false);

  async function copiar() {
    if (!conteudo) return;
    try {
      await navigator.clipboard.writeText(conteudo);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setCopiado(false);
    }
  }

  if (!conteudo) {
    return (
      <p className="text-sm text-tinta-suave">
        Ainda não gerei um post pra ti. Assim que a Vitrine tiver mais informação, o Prontim monta
        um texto pronto pra postar todo dia.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {criadoEm && <p className="text-xs text-tinta-suave">Post de {formatarData(criadoEm)}</p>}
      <p className="whitespace-pre-wrap rounded-lg bg-papel-2 p-3 text-sm text-tinta">{conteudo}</p>
      <Botao type="button" variante="secundario" className="!py-2 text-sm" onClick={copiar}>
        {copiado ? "Copiado! ✅" : "Copiar texto"}
      </Botao>
      <p className="text-xs text-tinta-suave">
        Cola no Instagram (ou onde quiser divulgar) — o Prontim escreveu, você só posta.
      </p>
    </div>
  );
}
