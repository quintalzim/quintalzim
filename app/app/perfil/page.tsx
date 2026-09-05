import AtivarNotificacoes from "@/components/app/AtivarNotificacoes";
import BotaoSairQuintal from "@/components/app/BotaoSairQuintal";
import FormularioAlterarSenha from "@/components/app/FormularioAlterarSenha";
import FormularioEditarNome from "@/components/app/FormularioEditarNome";
import FormularioEditarTelefone from "@/components/app/FormularioEditarTelefone";
import PainelAssinatura from "@/components/app/PainelAssinatura";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { planosPorCategoria } from "@/lib/planos";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nome = (user?.user_metadata?.name as string | undefined)?.trim() || "";

  let telefone = "";
  let cpf = "";
  if (user) {
    const { data: perfil } = await supabase
      .from("profiles")
      .select("phone, cpf")
      .eq("id", user.id)
      .single();
    telefone = perfil?.phone ?? "";
    cpf = perfil?.cpf ?? "";
  }

  const { data: assinatura } = user
    ? await supabase
        .from("assinaturas")
        .select("status, plano")
        .eq("profile_id", user.id)
        .eq("categoria", "pf")
        .maybeSingle()
    : { data: null };

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
        <Selo variante="verde">Avisos</Selo>
        <p className="text-sm text-tinta-suave">
          Ativa as notificações do Quintalzim direto no navegador — lembretes e avisos sem
          depender do WhatsApp.
        </p>
        <AtivarNotificacoes />
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Minha assinatura</Selo>
        <PainelAssinatura
          categoria="pf"
          planos={planosPorCategoria("pf")}
          assinatura={assinatura ?? null}
          cpfAtual={cpf}
        />
      </Card>

      <BotaoSairQuintal />
    </div>
  );
}
