"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import { createClient } from "@/lib/supabase/client";

function normalizarTelefone(bruto: string): string | null {
  const digitos = bruto.replace(/\D/g, "");
  if (!digitos) return null;

  // Já veio com DDI (ex: 55...): usa como está se tiver 12-13 dígitos
  if (digitos.length === 12 || digitos.length === 13) return digitos;

  // Veio só com DDD + número (10 ou 11 dígitos): prefixa com 55 (Brasil)
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;

  return null;
}

function formatarParaExibicao(digitos: string): string {
  // Espera formato 55DDNNNNNNNNN (com DDI 55 na frente)
  const semDdi = digitos.startsWith("55") ? digitos.slice(2) : digitos;
  const ddd = semDdi.slice(0, 2);
  const resto = semDdi.slice(2);
  if (resto.length === 9) {
    return `(${ddd}) ${resto.slice(0, 5)}-${resto.slice(5)}`;
  }
  if (resto.length === 8) {
    return `(${ddd}) ${resto.slice(0, 4)}-${resto.slice(4)}`;
  }
  return digitos;
}

export default function FormularioEditarTelefone({ telefoneAtual }: { telefoneAtual: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [telefone, setTelefone] = useState(telefoneAtual ? formatarParaExibicao(telefoneAtual) : "");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemErro("");
    setSucesso(false);

    const normalizado = normalizarTelefone(telefone);
    if (!normalizado) {
      setMensagemErro("Número inválido. Use DDD + número, ex: (35) 99999-9999.");
      return;
    }

    setCarregando(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMensagemErro("Sessão expirada. Entre novamente.");
      setCarregando(false);
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, phone: normalizado }, { onConflict: "id" });

    if (error) {
      setMensagemErro("Não consegui salvar. Tenta de novo em instantes.");
      setCarregando(false);
      return;
    }

    setTelefone(formatarParaExibicao(normalizado));
    setSucesso(true);
    setCarregando(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <Campo
        rotulo="WhatsApp"
        name="telefone"
        type="tel"
        placeholder="(35) 99999-9999"
        required
        value={telefone}
        onChange={(e) => {
          setTelefone(e.target.value);
          setSucesso(false);
        }}
      />
      <p className="text-xs text-tinta-suave">
        É o número que você usa pra falar com o Prontim no WhatsApp.
      </p>
      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
      {sucesso && (
        <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
          Prontim ✅ WhatsApp vinculado
        </p>
      )}
      <Botao type="submit" disabled={carregando}>
        {carregando ? "Salvando..." : "Salvar WhatsApp"}
      </Botao>
    </form>
  );
}
