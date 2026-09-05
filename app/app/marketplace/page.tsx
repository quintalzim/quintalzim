import Link from "next/link";
import FormularioNovaDemanda from "@/components/app/FormularioNovaDemanda";
import FormularioPerfilProfissional from "@/components/app/FormularioPerfilProfissional";
import PainelAssinatura from "@/components/app/PainelAssinatura";
import PainelMinhasDemandas from "@/components/app/PainelMinhasDemandas";
import TelaBloqueada from "@/components/app/TelaBloqueada";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { nivelAtende, nivelPF } from "@/lib/assinaturas";
import { planosPorCategoria } from "@/lib/planos";
import { createClient } from "@/lib/supabase/server";

export default async function MarketplaceAppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <p className="text-tinta-suave">Entra na tua conta pra acessar o Marketplace.</p>
      </div>
    );
  }

  const nivel = await nivelPF(supabase, user.id);
  if (!nivelAtende(nivel, "base")) {
    return (
      <TelaBloqueada
        titulo="Marketplace"
        descricao="Personal trainers da região e o Balcão de Demandas ficam disponíveis assinando o plano PF."
        minimo="base"
      />
    );
  }

  const { data: perfil } = await supabase
    .from("profissionais_marketplace")
    .select("id, nome, descricao, cidade, contato, instagram, ativo, verificado")
    .eq("profile_id", user.id)
    .maybeSingle();

  const { data: perfilCpf } = await supabase.from("profiles").select("cpf").eq("id", user.id).maybeSingle();

  const { data: assinaturaProfissional } = await supabase
    .from("assinaturas")
    .select("status, plano")
    .eq("profile_id", user.id)
    .eq("categoria", "profissional")
    .maybeSingle();

  const { data: minhasDemandas } = await supabase
    .from("demandas_marketplace")
    .select(
      "id, categoria, descricao, local, prazo, valor_oferecido, status, interesses_demanda(id, profissional_profile_id, nome_interessado, contato_interessado, mensagem)"
    )
    .eq("autor_profile_id", user.id)
    .order("created_at", { ascending: false });

  const demandasFormatadas = (minhasDemandas ?? []).map((d) => ({
    ...d,
    interesses: d.interesses_demanda ?? [],
  }));

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Marketplace</h1>
        <p className="text-tinta-suave">
          Teu perfil profissional e o Balcão de Demandas, num lugar só.
        </p>
      </div>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Perfil profissional</Selo>
        <p className="text-sm text-tinta-suave">
          {perfil
            ? "Edita as informações que aparecem no diretório público."
            : "Ainda não tens um perfil. Cria pra aparecer no diretório de Personal Trainers."}
        </p>
        <FormularioPerfilProfissional profileId={user.id} perfilAtual={perfil ?? null} />
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Assinatura Profissional</Selo>
        <p className="text-sm text-tinta-suave">
          Destaque no diretório e recomendação da IA no plano de hábitos do Quiz-Funil.
        </p>
        <PainelAssinatura
          categoria="profissional"
          planos={planosPorCategoria("profissional")}
          assinatura={assinaturaProfissional ?? null}
          cpfAtual={perfilCpf?.cpf ?? ""}
        />
      </Card>

      <Card className="flex flex-col gap-2">
        <p className="text-sm text-tinta-suave">Ver o diretório público:</p>
        <Link
          href="/marketplace/personal-trainer"
          className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
        >
          Personal Trainers →
        </Link>
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Balcão de Demandas</Selo>
        <p className="text-sm text-tinta-suave">Precisa de algo pontual? Publica aqui.</p>
        <FormularioNovaDemanda autorProfileId={user.id} />
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Minhas demandas</Selo>
        <PainelMinhasDemandas demandasIniciais={demandasFormatadas} />
      </Card>

      <Card className="flex flex-col gap-2">
        <p className="text-sm text-tinta-suave">Ver o mural público de demandas:</p>
        <Link
          href="/marketplace/demandas"
          className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
        >
          Balcão de Demandas →
        </Link>
      </Card>
    </div>
  );
}
