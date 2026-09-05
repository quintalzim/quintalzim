import BriefingEmpresa from "@/components/app/BriefingEmpresa";
import CardLinkEmpresa from "@/components/app/CardLinkEmpresa";
import FormularioCriarEmpresa from "@/components/app/FormularioCriarEmpresa";
import FormularioEditarVitrine from "@/components/app/FormularioEditarVitrine";
import PainelAgendamentos from "@/components/app/PainelAgendamentos";
import PainelCatalogo from "@/components/app/PainelCatalogo";
import PainelPedidosCatalogo from "@/components/app/PainelPedidosCatalogo";
import PostDoDia from "@/components/app/PostDoDia";
import WizardWhatsAppEmpresa from "@/components/app/WizardWhatsAppEmpresa";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { calcularDreMesAtual } from "@/lib/empresa/dre";
import { createClient } from "@/lib/supabase/server";

function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

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

  const { data: produtos } = await supabase
    .from("produtos_empresa")
    .select("id, nome, descricao, preco, tipo, ativo")
    .eq("empresa_id", empresa.id)
    .order("created_at", { ascending: true });

  const { data: pedidosCatalogo } = await supabase
    .from("pedidos_catalogo")
    .select(
      "id, cliente_profile_id, nome_produto, preco_unitario, quantidade, nome_cliente, telefone_cliente, observacao, status"
    )
    .eq("empresa_id", empresa.id)
    .order("created_at", { ascending: false });

  const dre = await calcularDreMesAtual(supabase, empresa.id, empresa.owner_id);
  const nomeMes = new Date().toLocaleDateString("pt-BR", { month: "long" });

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

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Gestão</Selo>
        <h2 className="text-lg font-bold text-tinta">DRE de {nomeMes}</h2>
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-sm">
            <span className="text-tinta-suave">Receita ({dre.qtdVendas} venda(s))</span>
            <span className="font-semibold text-verde-escuro">{formatarReais(dre.receita)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-tinta-suave">Despesa</span>
            <span className="font-semibold text-terracota-escuro">{formatarReais(dre.despesa)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-papel-2 pt-1.5 text-sm">
            <span className="font-semibold text-tinta">Resultado</span>
            <span className="font-bold text-tinta">{formatarReais(dre.resultado)}</span>
          </div>
        </div>
        <p className="text-xs text-tinta-suave">
          Receita conta agendamentos e pedidos do Catálogo confirmados com valor preenchido.
          Despesa puxa do Quintal de Finanças as categorias com &quot;PJ&quot; no nome — se tua
          categoria da Empresa tem outro nome, os números ficam incompletos.
        </p>
      </Card>

      <PainelCatalogo empresaId={empresa.id} produtosIniciais={produtos ?? []} />

      <PainelPedidosCatalogo
        empresaNome={empresa.nome}
        pedidosIniciais={pedidosCatalogo ?? []}
      />
    </div>
  );
}
