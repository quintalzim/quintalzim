"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import { aplicarMascaraTelefone, normalizarTelefone } from "@/lib/telefone";
import type { CategoriaServico } from "@/lib/categorias-servico";
import { createClient } from "@/lib/supabase/client";

type Perfil = {
  id: string;
  nome: string;
  descricao: string | null;
  cidade: string | null;
  contato: string | null;
  instagram: string | null;
  ativo: boolean;
  verificado: boolean;
  categoria_id: string | null;
};

export default function FormularioPerfilProfissional({
  profileId,
  perfilAtual,
  categorias,
}: {
  profileId: string;
  perfilAtual: Perfil | null;
  categorias: CategoriaServico[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [categoriaId, setCategoriaId] = useState(perfilAtual?.categoria_id ?? categorias[0]?.id ?? "");
  const [nome, setNome] = useState(perfilAtual?.nome ?? "");
  const [descricao, setDescricao] = useState(perfilAtual?.descricao ?? "");
  const [cidade, setCidade] = useState(perfilAtual?.cidade ?? "");
  const [contato, setContato] = useState(
    perfilAtual?.contato ? aplicarMascaraTelefone(perfilAtual.contato) : ""
  );
  const [instagram, setInstagram] = useState(perfilAtual?.instagram ?? "");
  const [ativo, setAtivo] = useState(perfilAtual?.ativo ?? true);
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");
  const [sucesso, setSucesso] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemErro("");
    setSucesso(false);

    if (!nome.trim()) {
      setMensagemErro("Conta teu nome (ou nome do negócio).");
      return;
    }

    if (!categoriaId) {
      setMensagemErro("Escolhe o tipo de serviço que você oferece.");
      return;
    }

    if (contato.trim() && !normalizarTelefone(contato)) {
      setMensagemErro("WhatsApp inválido. Confere o DDD e o número (com o 9 na frente).");
      return;
    }

    setCarregando(true);

    const dados = {
      nome: nome.trim(),
      descricao: descricao.trim() || null,
      cidade: cidade.trim() || null,
      contato: contato.trim() || null,
      instagram: instagram.trim() || null,
      ativo,
      categoria_id: categoriaId,
    };

    const { error } = perfilAtual
      ? await supabase.from("profissionais_marketplace").update(dados).eq("id", perfilAtual.id)
      : await supabase.from("profissionais_marketplace").insert({
          ...dados,
          profile_id: profileId,
        });

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
        <label htmlFor="categoria-profissional" className="font-titulo text-sm font-semibold text-tinta">
          Tipo de serviço
        </label>
        <select
          id="categoria-profissional"
          required
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
          className="rounded-md border-2 border-papel-2 bg-white px-4 py-3 text-base text-tinta outline-none transition-colors focus:border-verde"
        >
          {categorias.length === 0 && <option value="">Nenhuma categoria disponível</option>}
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.emoji ? `${c.emoji} ` : ""}
              {c.nome}
            </option>
          ))}
        </select>
      </div>
      <Campo
        rotulo="Nome"
        type="text"
        placeholder="Como você quer aparecer no diretório"
        required
        value={nome}
        onChange={(e) => setNome(e.target.value)}
      />
      <div className="flex flex-col gap-1.5">
        <label htmlFor="descricao-profissional" className="font-titulo text-sm font-semibold text-tinta">
          Sobre você
        </label>
        <textarea
          id="descricao-profissional"
          rows={3}
          placeholder="Sua experiência, especialidade, o que te diferencia"
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          className="rounded-md border-2 border-papel-2 bg-white px-4 py-3 text-base text-tinta outline-none transition-colors placeholder:text-tinta-suave/60 focus:border-verde"
        />
      </div>
      <Campo
        rotulo="Cidade"
        type="text"
        placeholder="Onde você atende"
        value={cidade}
        onChange={(e) => setCidade(e.target.value)}
      />
      <Campo
        rotulo="Contato (WhatsApp)"
        type="tel"
        inputMode="numeric"
        maxLength={16}
        placeholder="(35) 99999-9999"
        value={contato}
        onChange={(e) => setContato(aplicarMascaraTelefone(e.target.value))}
      />
      <Campo
        rotulo="Instagram"
        type="text"
        placeholder="@seuperfil"
        value={instagram}
        onChange={(e) => setInstagram(e.target.value)}
      />

      {perfilAtual && (
        <label className="flex items-center gap-2 text-sm text-tinta">
          <input type="checkbox" checked={ativo} onChange={(e) => setAtivo(e.target.checked)} />
          Aparecer no diretório público
        </label>
      )}

      {perfilAtual && (
        <p className="text-xs text-tinta-suave">
          {perfilAtual.verificado
            ? "Perfil verificado ✅"
            : "Perfil ainda não verificado — a verificação (documento/comprovação) é feita manualmente por enquanto."}
        </p>
      )}

      {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
      {sucesso && (
        <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
          Perfil salvo. Prontim ✅
        </p>
      )}
      <Botao type="submit" disabled={carregando}>
        {carregando ? "Salvando..." : perfilAtual ? "Salvar perfil" : "Criar perfil"}
      </Botao>
    </form>
  );
}
