"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import { aplicarMascaraTelefone, formatarTelefoneExibicao, normalizarTelefone } from "@/lib/telefone";
import { createClient } from "@/lib/supabase/client";

export default function FormularioEditarTelefone({ telefoneAtual }: { telefoneAtual: string }) {
  const router = useRouter();
  const supabase = createClient();

  const [telefone, setTelefone] = useState(
    telefoneAtual ? formatarTelefoneExibicao(telefoneAtual) : ""
  );
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

    setTelefone(formatarTelefoneExibicao(normalizado));
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
        inputMode="numeric"
        maxLength={16}
        required
        value={telefone}
        onChange={(e) => {
          setTelefone(aplicarMascaraTelefone(e.target.value));
          setSucesso(false);
        }}
      />
      <p className="text-xs text-tinta-suave">
        É o número que você usa pra falar com o Prontim no WhatsApp — precisa ser celular (com o
        9 na frente).
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
