import BriefingEmpresa from "@/components/app/BriefingEmpresa";
import CardLinkEmpresa from "@/components/app/CardLinkEmpresa";
import FormularioCriarEmpresa from "@/components/app/FormularioCriarEmpresa";
import FormularioEditarVitrine from "@/components/app/FormularioEditarVitrine";
import PainelAgendamentos from "@/components/app/PainelAgendamentos";
import PostDoDia from "@/components/app/PostDoDia";
import WizardWhatsAppEmpresa from "@/components/app/WizardWhatsAppEmpresa";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/server";

export default async function EmpresaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: empresa } = user
    ? await supabase.from("empresas").select("*").eq("owner_id", user.id).maybeSingle()
    : { data: null };

  if (!empresa) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <div>
          <h1 className="text-2xl font-extrabold text-tinta">Sua Empresa no Quintalzim</h1>
          <p className="text-tinta-suave">
            Cadastra o nome do teu negócio pra começar a montar a Vitrine e ligar o WhatsApp.
          </p>
        </div>
        <Card className="flex flex-col gap-3">
          <Selo variante="verde">Primeiro passo</Selo>
          <FormularioCriarEmpresa />
        </Card>
      </div>
    );
  }

  const { data: agendamentos } = await supabase
    .from("agendamentos")
    .select("id, cliente_profile_id, nome_cliente, telefone_cliente, servico, data_hora_desejada, observacao, status")
    .eq("empresa_id", empresa.id)
    .order("data_hora_desejada", { ascending: true });

  const { data: postDoDia } = await supabase
    .from("posts_empresa")
    .select("conteudo, created_at")
    .eq("empresa_id", empresa.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const { data: briefingEmpresa } = await supabase
    .from("briefings_empresa")
    .select("mensagem, created_at")
    .eq("empresa_id", empresa.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">{empresa.nome}</h1>
        <p className="text-tinta-suave">Painel da tua Empresa no Quintalzim.</p>
      </div>

      <CardLinkEmpresa slug={empresa.slug} />

      <Card className="flex flex-col gap-2">
        <Selo variante="verde">Resumo do dia</Selo>
        <BriefingEmpresa
          mensagem={briefingEmpresa?.mensagem ?? null}
          criadoEm={briefingEmpresa?.created_at ?? null}
        />
      </Card>

      <PainelAgendamentos
        empresaId={empresa.id}
        empresaNome={empresa.nome}
        agendamentosIniciais={agendamentos ?? []}
      />

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Vitrine</Selo>
        <p className="text-sm text-tinta-suave">
          O que aparece pra quem abre o teu link — preenche pra deixar mais completo.
        </p>
        <FormularioEditarVitrine empresaId={empresa.id} vitrineAtual={empresa} />
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Post do dia</Selo>
        <p className="text-sm text-tinta-suave">
          Todo dia o Prontim escreve um texto novo com base na tua Vitrine — é só copiar e postar.
        </p>
        <PostDoDia conteudo={postDoDia?.conteudo ?? null} criadoEm={postDoDia?.created_at ?? null} />
      </Card>

      <WizardWhatsAppEmpresa empresa={empresa} />

      <Card className="flex flex-col gap-2">
        <Selo variante="terracota">Em breve</Selo>
        <h2 className="text-lg font-bold text-tinta">Catálogo</h2>
        <p className="text-sm text-tinta-suave">Vendas pelo Quintalzim chegam numa próxima etapa.</p>
      </Card>
    </div>
  );
}
