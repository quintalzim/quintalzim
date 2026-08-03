"use client";

import { useState } from "react";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

export default function CardLinkEmpresa({ slug }: { slug: string }) {
  const [copiado, setCopiado] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/b/${slug}` : `/b/${slug}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      // clipboard indisponível — usuário pode selecionar o texto manualmente
    }
  }

  return (
    <Card className="flex flex-col gap-3">
      <Selo variante="verde">Compartilhe com seus clientes</Selo>
      <p className="text-sm text-tinta-suave">
        Manda esse link no Status do WhatsApp, no Instagram ou deixa no balcão. Quem clicar deixa o
        contato e você já pode avisar e lembrar sem precisar do WhatsApp do negócio.
      </p>
      <div className="rounded-md border-2 border-papel-2 bg-white px-4 py-3 text-sm text-tinta break-all">
        {link}
      </div>
      <Botao type="button" variante="secundario" onClick={copiar}>
        {copiado ? "Copiado! ✅" : "Copiar link"}
      </Botao>
    </Card>
  );
}
