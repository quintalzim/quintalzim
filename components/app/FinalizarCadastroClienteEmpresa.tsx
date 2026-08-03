"use client";

import { FormEvent, useEffect, useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import CampoSenha from "@/components/ui/CampoSenha";
import Card from "@/components/ui/Card";
import { CHAVE_CADASTRO_PENDENTE, type CadastroPendente } from "@/lib/empresa-clientes";
import { createClient } from "@/lib/supabase/client";
import { mensagemErroAuth } from "@/lib/supabase/erros";

type Etapa = "nenhuma" | "boas-vindas" | "criar-senha";

// Roda uma vez por carregamento de página autenticada. Se existir um cadastro
// de cliente-final pendente (salvo antes do magic link em /b/[slug]), finaliza
// o vínculo com a empresa e, na primeira vez, oferece conhecer o resto do
// Quintalzim + criar uma senha opcional (pra não depender de link por e-mail
// toda vez que quiser entrar).
export default function FinalizarCadastroClienteEmpresa() {
  const [etapa, setEtapa] = useState<Etapa>("nenhuma");
  const [nome, setNome] = useState("");

  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function finalizar() {
      let bruto: string | null = null;
      try {
        bruto = window.localStorage.getItem(CHAVE_CADASTRO_PENDENTE);
      } catch {
        return;
      }
      if (!bruto) return;

      let pendente: CadastroPendente;
      try {
        pendente = JSON.parse(bruto);
      } catch {
        window.localStorage.removeItem(CHAVE_CADASTRO_PENDENTE);
        return;
      }

      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user || cancelado) return;

      await supabase.from("empresa_clientes").upsert(
        {
          empresa_id: pendente.empresaId,
          profile_id: user.id,
          nome: pendente.nome,
          telefone: pendente.telefone,
        },
        { onConflict: "empresa_id,profile_id" }
      );

      const { data: perfil } = await supabase
        .from("profiles")
        .select("phone")
        .eq("id", user.id)
        .maybeSingle();

      if (!perfil?.phone) {
        await supabase
          .from("profiles")
          .upsert({ id: user.id, phone: pendente.telefone }, { onConflict: "id" });
      }

      window.localStorage.removeItem(CHAVE_CADASTRO_PENDENTE);

      if (!cancelado) {
        setNome(pendente.nome);
        setEtapa("boas-vindas");
      }
    }

    finalizar();

    return () => {
      cancelado = true;
    };
  }, []);

  async function handleCriarSenha(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMensagemErro("");

    if (senha.length < 8) {
      setMensagemErro("Sua senha precisa de pelo menos 8 caracteres.");
      return;
    }
    if (senha !== confirmarSenha) {
      setMensagemErro("As senhas digitadas são diferentes. Confere de novo?");
      return;
    }

    setCarregando(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: senha });

    if (error) {
      setMensagemErro(mensagemErroAuth(error));
      setCarregando(false);
      return;
    }

    setCarregando(false);
    setEtapa("nenhuma");
  }

  if (etapa === "nenhuma") return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-tinta/40 px-5 py-10">
      <Card className="flex w-full max-w-sm flex-col gap-4 bg-papel">
        {etapa === "boas-vindas" && (
          <>
            <p className="font-titulo text-lg font-extrabold text-tinta">
              {nome ? `Prontim ✅ Bem-vindo, ${nome.split(" ")[0]}!` : "Prontim ✅ Bem-vindo!"}
            </p>
            <p className="text-sm text-tinta-suave">
              Você já vai receber os avisos por aqui. E já que chegou até o Quintalzim: dá uma
              olhada em outros serviços do portal (finanças, catálogo e mais) quando quiser — é o
              mesmo login.
            </p>
            <p className="text-sm text-tinta-suave">
              Se preferir entrar direto da próxima vez, sem esperar link por e-mail, cria uma senha
              agora. É opcional.
            </p>
            <div className="flex flex-col gap-2">
              <Botao type="button" onClick={() => setEtapa("criar-senha")}>
                Criar senha e continuar
              </Botao>
              <Botao type="button" variante="secundario" onClick={() => setEtapa("nenhuma")}>
                Agora não, só quero os avisos
              </Botao>
            </div>
          </>
        )}

        {etapa === "criar-senha" && (
          <>
            <p className="font-titulo text-lg font-extrabold text-tinta">Cria sua senha</p>
            <form onSubmit={handleCriarSenha} className="flex flex-col gap-3">
              <CampoSenha
                rotulo="Nova senha"
                name="senha"
                required
                minLength={8}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
              <CampoSenha
                rotulo="Confirma a senha"
                name="confirmarSenha"
                required
                minLength={8}
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
              />
              {mensagemErro && <p className="text-sm text-terracota-escuro">{mensagemErro}</p>}
              <Botao type="submit" disabled={carregando}>
                {carregando ? "Salvando..." : "Salvar senha"}
              </Botao>
              <Botao type="button" variante="secundario" onClick={() => setEtapa("nenhuma")}>
                Pular por enquanto
              </Botao>
            </form>
          </>
        )}
      </Card>
    </div>
  );
}
