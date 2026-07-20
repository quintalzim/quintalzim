"use client";

import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";

type Estado = "ocioso" | "enviando" | "sucesso" | "erro";

export default function ListaEsperaForm() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>("ocioso");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");

    try {
      const resposta = await fetch(
        "https://n8n.quintalzim.com.br/webhook/lista-espera",
        {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams({ email }).toString(),
        }
      );

      if (!resposta.ok) throw new Error("Falha no envio");

      setEstado("sucesso");
    } catch {
      setEstado("erro");
    }
  }

  if (estado === "sucesso") {
    return (
      <div className="rounded-xl bg-verde/10 px-5 py-4 text-center font-titulo font-semibold text-verde-escuro">
        Recebemos seu e-mail! Prontim ✅
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <Campo
            rotulo="Seu e-mail"
            type="email"
            name="email"
            placeholder="voce@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <Botao type="submit" disabled={estado === "enviando"}>
          {estado === "enviando" ? "Enviando..." : "Entrar na lista"}
        </Botao>
      </div>
      {estado === "erro" && (
        <p className="text-sm text-terracota-escuro">
          Não deu certo agora. Pode tentar de novo?
        </p>
      )}
    </form>
  );
}
