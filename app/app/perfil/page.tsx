import Link from "next/link";
import BotaoSairQuintal from "@/components/app/BotaoSairQuintal";
import FormularioAlterarSenha from "@/components/app/FormularioAlterarSenha";
import FormularioEditarNome from "@/components/app/FormularioEditarNome";
import FormularioEditarTelefone from "@/components/app/FormularioEditarTelefone";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nome = (user?.user_metadata?.name as string | undefined)?.trim() || "";

  let telefone = "";
  if (user) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("phone")
      .eq("id", user.id)
      .single();
    telefone = perfil?.phone ?? "";
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Perfil</h1>
        <p className="text-tinta-suave">Seus dados e sua assinatura.</p>
      </div>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Meus dados</Selo>
        <div>
          <p className="text-xs font-semibold text-tinta-suave">E-mail</p>
          <p className="text-lg font-bold text-tinta">{user?.email}</p>
        </div>
        <FormularioEditarNome nomeAtual={nome} />
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Prontim no WhatsApp</Selo>
        <p className="text-sm text-tinta-suave">
          Vincule seu número pra registrar despesas conversando com o Prontim.
        </p>
        <FormularioEditarTelefone telefoneAtual={telefone} />
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Segurança</Selo>
        <p className="text-sm text-tinta-suave">Escolhe uma senha nova pro teu cadeado.</p>
        <FormularioAlterarSenha />
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="terracota">Tem um negócio?</Selo>
        <p className="text-sm text-tinta-suave">
          Cadastra tua Empresa no Quintalzim e prepara o Recepcionista pra atender no WhatsApp que
          você já usa.
        </p>
        <Link
          href="/app/empresa"
          className="text-center font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
        >
          Cadastrar minha Empresa →
        </Link>
      </Card>

      <Card className="flex flex-col gap-2">
        <Selo variante="terracota">Em breve</Selo>
        <h2 className="text-lg font-bold text-tinta">Minha assinatura</h2>
        <p className="text-sm text-tinta-suave">
          Plano, cobrança e histórico de pagamentos.
        </p>
      </Card>

      <BotaoSairQuintal />
    </div>
  );
}
