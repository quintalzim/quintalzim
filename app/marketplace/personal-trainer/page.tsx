import Link from "next/link";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/server";

export default async function DiretorioPersonalTrainerPage() {
  const supabase = await createClient();

  const { data: profissionais } = await supabase
    .from("profissionais_marketplace")
    .select("id, nome, descricao, cidade, contato, instagram, verificado")
    .eq("categoria", "personal_trainer")
    .eq("ativo", true)
    .order("verificado", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="flex flex-1 justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div>
          <Link href="/marketplace" className="font-titulo text-sm font-semibold text-verde-escuro">
            ← Marketplace
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-tinta">Personal Trainers</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            Profissionais da tua região prontos pra te ajudar a manter o plano de hábitos.
          </p>
        </div>

        {(!profissionais || profissionais.length === 0) && (
          <Card className="flex flex-col gap-2">
            <p className="text-sm text-tinta-suave">
              Ainda não tem ninguém cadastrado por aqui. Se você é personal trainer, seja o
              primeiro.
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
          <p className="text-sm text-tinta-suave">É personal trainer e quer aparecer aqui?</p>
          <Link
            href="/app/marketplace"
            className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            Entra no Quintalzim e cria teu perfil →
          </Link>
        </Card>
      </div>
    </div>
  );
}
