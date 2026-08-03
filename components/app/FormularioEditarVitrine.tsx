"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import { createClient } from "@/lib/supabase/client";

type VitrineAtual = {
  descricao?: string | null;
  endereco?: string | null;
  telefone_contato?: string | null;
  instagram?: string | null;
  horario_funcionamento?: string | null;
};

export default function FormularioEditarVitrine({
  empresaId,
  vitrineAtual,
}: {
  empresaId: string;
  vitrineAtual: VitrineAtual;
}) {
  const router = useRouter();
  const supabase = createClient();

  const [descricao, setDescricao] = useState(vitrineAtual.descricao ?? "");
  const [endereco, setEndereco] = useState(vitrineAtual.endereco ?? "");
  const [telefoneContato, setTelefoneContato] = useState(vitrineAtual.telefone_contato ?? "");
  const [instagram, setInstagram] = useState(vitrineAtual.instagram ?? "");
  const [horario, setHorario] = useState(vitrineAtual.horario_funcionamento ?? "");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemErro("");
    setSucesso(false);
    setCarregando(true);

    const { error } = await supabase
      .from("empresas")
      .update({
        descricao: descricao.trim() || null,
        endereco: endereco.trim() || null,
        telefone_contato: telefoneContato.trim() || null,
        instagram: instagram.trim() || null,
        horario_funcionamento: horario.trim() || null,
      })
      .eq("id", empresaId);

    if (error) {
      setMensagemErro("Não consegui salvar. Tenta de novo em instantes.");
      setCarregando(false);
      return;
    }

    setSucesso(true);
    setCarregando(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="descricao-vitrine"
          className="font-titulo text-sm font-semibold text-tinta"
        >
          Sobre o negócio
        </label>
        <textarea
          id="descricao-vitrine"
          name="descricao"
          rows={3}
          placeholder="Conta em poucas linhas o que vocês fazem"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="rounded-md border-2 border-papel-2 bg-white px-4 py-3 text-base text-tinta outline-none transition-colors placeholder:text-tinta-suave/60 focus:border-verde"
        />
      </div>

      <Campo
        rotulo="Endereço"
        name="endereco"
        type="text"
        placeholder="Rua, número, bairro"
        value={endereco}
        onChange={(e) => setEndereco(e.target.value)}
      />
      <Campo
        rotulo="Horário de funcionamento"
        name="horario"
        type="text"
        placeholder="Seg a sáb, 9h às 18h"
        value={horario}
        onChange={(e) => setHorario(e.target.value)}
      />
      <Campo
        rotulo="Telefone de contato (pra mostrar na Vitrine)"
        name="telefoneContato"
        type="tel"
        placeholder="(35) 99999-9999"
        value={telefoneContato}
        onChange={(e) => setTelefoneContato(e.target.value)}
      />
      <Campo
        rotulo="Instagram"
        name="instagram"
        type="text"
        placeholder="@seunegocio"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
      />

      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
      {sucesso && (
        <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
          Vitrine atualizada. Prontim ✅
        </p>
      )}
      <Botao type="submit" disabled={carregando}>
        {carregando ? "Salvando..." : "Salvar Vitrine"}
      </Botao>
    </form>
  );
}
