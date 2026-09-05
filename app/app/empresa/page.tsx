import BriefingEmpresa from "@/components/app/BriefingEmpresa";
import CardLinkEmpresa from "@/components/app/CardLinkEmpresa";
import FormularioCriarEmpresa from "@/components/app/FormularioCriarEmpresa";
import FormularioEditarVitrine from "@/components/app/FormularioEditarVitrine";
import PainelAgendamentos from "@/components/app/PainelAgendamentos";
import PainelAssinantesClube from "@/components/app/PainelAssinantesClube";
import PainelAssinatura from "@/components/app/PainelAssinatura";
import PainelBloqueadoEmpresa from "@/components/app/PainelBloqueadoEmpresa";
import PainelCatalogo from "@/components/app/PainelCatalogo";
import PainelClube from "@/components/app/PainelClube";
import PainelPedidosCatalogo from "@/components/app/PainelPedidosCatalogo";
import PostDoDia from "@/components/app/PostDoDia";
import WizardWhatsAppEmpresa from "@/components/app/WizardWhatsAppEmpresa";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { nivelEmpresa, nivelEmpresaAtende, nomeNivelEmpresa } from "@/lib/assinaturas";
import { calcularDreMesAtual } from "@/lib/empresa/dre";
import { planosPorCategoria } from "@/lib/planos";
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

  const { data: planosClube } = await supabase
    .from("planos_clube")
    .select("id, nome, descricao, valor, ativo")
    .eq("empresa_id", empresa.id)
    .order("created_at", { ascending: true });

  const { data: assinantesClube } = await supabase
    .from("assinaturas_clube")
    .select(
      "id, cliente_profile_id, nome_plano, valor_plano, nome_cliente, telefone_cliente, status"
    )
    .eq("empresa_id", empresa.id)
    .order("created_at", { ascending: false });

  const { data: perfilCpf } = await supabase
    .from("profiles")
    .select("cpf")
    .eq("id", empresa.owner_id)
    .maybeSingle();

  const { data: assinaturaEmpresa } = await supabase
    .from("assinaturas")
    .select("status, plano")
    .eq("profile_id", empresa.owner_id)
    .eq("categoria", "empresa")
    .maybeSingle();

  const dre = await calcularDreMesAtual(supabase, empresa.id, empresa.owner_id);
  const nomeMes = new Date().toLocaleDateString("pt-BR", { month: "long" });

  const nivel = await nivelEmpresa(supabase, empresa.owner_id);
  const temStart = nivelEmpresaAtende(nivel, "start");
  const temPro = nivelEmpresaAtende(nivel, "pro");
  const temCompleto = nivelEmpresaAtende(nivel, "completo");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">{empresa.nome}</h1>
        <p className="text-tinta-suave">Painel da tua Empresa no Quintalzim.</p>
      </div>

      <CardLinkEmpresa slug={empresa.slug} />

      <Card id="assinatura-empresa" className="flex flex-col gap-3">
        <Selo variante="verde">Assinatura da Empresa</Selo>
        <PainelAssinatura
          categoria="empresa"
          planos={planosPorCategoria("empresa")}
          assinatura={assinaturaEmpresa ?? null}
          cpfAtual={perfilCpf?.cpf ?? ""}
        />
      </Card>

      {temPro ? (
        <>
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
        </>
      ) : (
        <PainelBloqueadoEmpresa
          titulo="Agendamentos & Resumo do dia"
          descricao="Recepcionista IA (pedido de horário, confirmação em 1 toque) e o resumo diário da agenda ficam disponíveis a partir do plano Empresa Pro."
          nomePlano={nomeNivelEmpresa("pro")}
        />
      )}

      {temStart ? (
        <Card className="flex flex-col gap-3">
          <Selo variante="verde">Vitrine</Selo>
          <p className="text-sm text-tinta-suave">
            O que aparece pra quem abre o teu link — preenche pra deixar mais completo.
          </p>
          <FormularioEditarVitrine empresaId={empresa.id} vitrineAtual={empresa} />
        </Card>
      ) : (
        <PainelBloqueadoEmpresa
          titulo="Vitrine"
          descricao="O mini-site do teu negócio (endereço, horário, contato, catálogo) fica disponível a partir do plano Empresa Start."
          nomePlano={nomeNivelEmpresa("start")}
        />
      )}

      {temPro ? (
        <Card className="flex flex-col gap-3">
          <Selo variante="verde">Post do dia</Selo>
          <p className="text-sm text-tinta-suave">
            Todo dia o Prontim escreve um texto novo com base na tua Vitrine — é só copiar e
            postar.
          </p>
          <PostDoDia
            conteudo={postDoDia?.conteudo ?? null}
            criadoEm={postDoDia?.created_at ?? null}
          />
        </Card>
      ) : (
        <PainelBloqueadoEmpresa
          titulo="Post do dia"
          descricao="Texto pronto de Instagram todo dia, gerado a partir da tua Vitrine, fica disponível a partir do plano Empresa Pro."
          nomePlano={nomeNivelEmpresa("pro")}
        />
      )}

      <WizardWhatsAppEmpresa empresa={empresa} />

      {temCompleto ? (
        <Card className="flex flex-col gap-3">
          <Selo variante="verde">Gestão</Selo>
          <h2 className="text-lg font-bold text-tinta">DRE de {nomeMes}</h2>
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between text-sm">
              <span className="text-tinta-suave">
                Receita ({dre.qtdVendas} venda(s)
                {dre.qtdAssinantesClube > 0 && ` + ${dre.qtdAssinantesClube} do Clube`})
              </span>
              <span className="font-semibold text-verde-escuro">{formatarReais(dre.receita)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-tinta-suave">Despesa</span>
              <span className="font-semibold text-terracota-escuro">
                {formatarReais(dre.despesa)}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-papel-2 pt-1.5 text-sm">
              <span className="font-semibold text-tinta">Resultado</span>
              <span className="font-bold text-tinta">{formatarReais(dre.resultado)}</span>
            </div>
          </div>
          <p className="text-xs text-tinta-suave">
            Receita conta agendamentos e pedidos do Catálogo confirmados com valor preenchido, mais
            os assinantes ativos do Clube (contam todo mês, enquanto a assinatura durar). Despesa
            puxa do Quintal de Finanças as categorias com &quot;PJ&quot; no nome — se tua categoria
            da Empresa tem outro nome, os números ficam incompletos.
          </p>
        </Card>
      ) : (
        <PainelBloqueadoEmpresa
          titulo="Gestão — DRE"
          descricao="Receita, despesa e resultado do mês, calculados automaticamente a partir dos agendamentos, pedidos do Catálogo e do Quintal de Finanças, ficam disponíveis a partir do plano Empresa Completo."
          nomePlano={nomeNivelEmpresa("completo")}
        />
      )}

      {temStart ? (
        <>
          <PainelCatalogo empresaId={empresa.id} produtosIniciais={produtos ?? []} />

          <PainelPedidosCatalogo empresaNome={empresa.nome} pedidosIniciais={pedidosCatalogo ?? []} />
        </>
      ) : (
        <PainelBloqueadoEmpresa
          titulo="Catálogo & Loja"
          descricao="Cadastrar produtos/serviços com preço e receber pedidos direto pela Vitrine fica disponível a partir do plano Empresa Start."
          nomePlano={nomeNivelEmpresa("start")}
        />
      )}

      {temCompleto ? (
        <>
          <PainelClube empresaId={empresa.id} planosIniciais={planosClube ?? []} />

          <PainelAssinantesClube empresaNome={empresa.nome} assinantesIniciais={assinantesClube ?? []} />
        </>
      ) : (
        <PainelBloqueadoEmpresa
          titulo="Clube de Assinaturas"
          descricao="Oferecer um plano recorrente pros teus próprios clientes (ex: corte ilimitado por mês) fica disponível a partir do plano Empresa Completo."
          nomePlano={nomeNivelEmpresa("completo")}
        />
      )}
    </div>
  );
}
