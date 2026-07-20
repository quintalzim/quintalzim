"use client";

import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";

type Estado = "ocioso" | "enviando" | "sucesso";

export default function ListaEsperaForm() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>("ocioso");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setEstado("enviando");

    try {
      await fetch("https://n8n.quintalzim.com.br/webhook/lista-espera", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ email, origem: "site-nextjs" }).toString(),
      });
    } catch {
      // erro de rede não deve quebrar a experiência de quem se cadastrou
    } finally {
      setEstado("sucesso");
    }
  }

  if (estado === "sucesso") {
    return (
      <div className="rounded-xl bg-verde/10 px-5 py-4 text-center font-titulo font-semibold text-verde-escuro">
        Prontim ✅ Você tá na lista. A gente se vê no quintal!
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
          {estado === "enviando" ? "Enviando..." : "Quero ser vizinho fundador"}
        </Botao>
      </div>
      <p className="text-xs text-tinta-suave">
        Prometido: nada de spam. Só o aviso de que o quintal abriu (e um mimo
        de fundador).
      </p>
    </form>
  );
}
