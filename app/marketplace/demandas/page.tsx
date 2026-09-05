import Link from "next/link";
import ListaDemandas from "@/components/public/ListaDemandas";
import { createClient } from "@/lib/supabase/server";

export default async function BalcaoDeDemandasPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: demandas } = await supabase
    .from("demandas_marketplace")
    .select("id, autor_profile_id, categoria, descricao, local, prazo, valor_oferecido")
    .eq("status", "aberta")
    .order("created_at", { ascending: false });

  let demandasComInteresse: string[] = [];
  if (user) {
    const { data: interesses } = await supabase
      .from("interesses_demanda")
      .select("demanda_id")
      .eq("profissional_profile_id", user.id);
    demandasComInteresse = (interesses ?? []).map((i) => i.demanda_id);
  }

  return (
    <div className="flex flex-1 justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div>
          <Link href="/marketplace" className="font-titulo text-sm font-semibold text-verde-escuro">
            ← Marketplace
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-tinta">Balcão de Demandas</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            Pedidos pontuais de gente da região. Se você pode ajudar, manifesta interesse.
          </p>
        </div>

        <ListaDemandas
          demandas={demandas ?? []}
          usuarioLogado={Boolean(user)}
          demandasComInteresse={demandasComInteresse}
        />

        <p className="text-center text-sm text-tinta-suave">
          Tem algo que você precisa?{" "}
          <Link
            href="/app/marketplace"
            className="font-titulo font-semibold text-verde-escuro underline underline-offset-2"
          >
            Publica sua demanda
          </Link>
        </p>
      </div>
    </div>
  );
}
