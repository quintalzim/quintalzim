import Link from "next/link";
import { notFound } from "next/navigation";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { ehSuperadmin } from "@/lib/admin/auth";
import { buscarCategoriaPorSlug } from "@/lib/categorias-servico";
import { clienteAdmin } from "@/lib/push-servidor";
import { createClient } from "@/lib/supabase/server";

// Diretório público de profissionais, agora genérico por categoria
// (docs/quintalzim-contexto-projeto.md, seção 3, v1.21) — substitui a antiga
// rota fixa /marketplace/personal-trainer. O link do Quiz-Funil pra
// "personal-trainer" (app/app/inicio/page.tsx) continua funcionando: o slug
// virou só mais um valor de [categoria].
export default async function DiretorioCategoriaPage({
  params,
}: {
  params: Promise<{ categoria: string }>;
}) {
  const { categoria: slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const usuarioLogado = Boolean(user);

  const categoria = await buscarCategoriaPorSlug(supabase, slug);
  if (!categoria) notFound();

  const { data: profissionaisBrutos } = await supabase
    .from("profissionais_marketplace")
    .select("id, profile_id, nome, descricao, cidade, contato, instagram, verificado")
    .eq("categoria_id", categoria.id)
    .eq("ativo", true)
    .order("verificado", { ascending: false })
    .order("created_at", { ascending: false });

  // Filtro retroativo (05/set): virar Profissional exige PF Premium (ver
  // docs/quintalzim-contexto-projeto.md), mas a página de perfil não
  // desativa automaticamente quem dá downgrade — o `ativo=true` sozinho não
  // reflete mais assinatura em dia. Checa aqui, via service role (a query
  // roda no servidor; nenhum dado de assinatura é exposto ao público, só
  // decide quem entra na lista).
  let profissionais = profissionaisBrutos ?? [];
  const admin = clienteAdmin();
  if (admin && profissionais.length > 0) {
    const profileIds = profissionais.map((p) => p.profile_id);
    const [{ data: perfis }, { data: assinaturasPf }] = await Promise.all([
      admin.from("profiles").select("id, role").in("id", profileIds),
      admin
        .from("assinaturas")
        .select("profile_id, plano, status")
        .in("profile_id", profileIds)
        .eq("categoria", "pf")
        .eq("status", "ativa"),
    ]);
    const superadmins = new Set((perfis ?? []).filter((p) => ehSuperadmin(p.role)).map((p) => p.id));
    const premiumAtivos = new Set(
      (assinaturasPf ?? []).filter((a) => a.plano === "pf_premium").map((a) => a.profile_id)
    );
    profissionais = profissionais.filter(
      (p) => superadmins.has(p.profile_id) || premiumAtivos.has(p.profile_id)
    );
  }

  return (
    <div className="flex flex-1 justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div>
          <div className="flex items-center justify-between">
            <Link href="/marketplace" className="font-titulo text-sm font-semibold text-verde-escuro">
              ← Marketplace
            </Link>
            {usuarioLogado && (
              <Link
                href="/app/inicio"
                className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
              >
                Voltar pro app →
              </Link>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-extrabold text-tinta">
            {categoria.emoji ? `${categoria.emoji} ` : ""}
            {categoria.nome}
          </h1>
          <p className="mt-1 text-sm text-tinta-suave">
            {categoria.descricao ?? `Profissionais de ${categoria.nome} da tua região.`}
          </p>
        </div>

        {(!profissionais || profissionais.length === 0) && (
          <Card className="flex flex-col gap-2">
            <p className="text-sm text-tinta-suave">
              Ainda não tem ninguém cadastrado por aqui. Se você atua nessa área, seja o primeiro.
            </p>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {(profissionais ?? []).map((p) => (
            <Card key={p.id} className="flex flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <h2 className="text-base font-bold text-tinta">{p.nome}</h2>
                {p.verificado && <Selo variante="verde">Verificado</Selo>}
              </div>
              {p.cidade && <p className="text-xs text-tinta-suave">{p.cidade}</p>}
              {p.descricao && <p className="text-sm text-tinta-suave">{p.descricao}</p>}
              <div className="mt-1 flex flex-col gap-0.5 text-sm">
                {p.contato && <p className="text-tinta">WhatsApp: {p.contato}</p>}
                {p.instagram && <p className="text-tinta">{p.instagram}</p>}
              </div>
            </Card>
          ))}
        </div>

        <Card className="flex flex-col gap-2">
          <p className="text-sm text-tinta-suave">
            {usuarioLogado
              ? `Atua com ${categoria.nome.toLowerCase()}?`
              : `Atua com ${categoria.nome.toLowerCase()} e quer aparecer aqui?`}
          </p>
          <Link
            href="/app/marketplace"
            className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            {usuarioLogado ? "Cria teu perfil no app →" : "Entra no Quintalzim e cria teu perfil →"}
          </Link>
        </Card>
      </div>
    </div>
  );
}
