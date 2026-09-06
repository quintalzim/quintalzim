import Link from "next/link";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { listarCategoriasAtivas } from "@/lib/categorias-servico";
import { createClient } from "@/lib/supabase/server";

// Hub público do Marketplace — até v1.20 tinha um único Card fixo pra
// "Personal Trainers". A partir de v1.21 a listagem é dinâmica: qualquer
// categoria de serviço cadastrada em /app/admin aparece aqui automaticamente,
// sem precisar mexer em código (docs/quintalzim-contexto-projeto.md, seção 3).
export default async function MarketplacePage() {
  const supabase = await createClient();
  const categorias = await listarCategoriasAtivas(supabase);

  return (
    <div className="flex flex-1 justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div>
          <Link href="/" className="font-titulo text-sm font-semibold text-verde-escuro">
            Quintalzim
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-tinta">Marketplace</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            A ponte entre quem precisa e quem oferece, aqui na tua região.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {categorias.map((categoria) => (
            <Link key={categoria.id} href={`/marketplace/${categoria.slug}`}>
              <Card className="flex h-full flex-col gap-2 transition-transform hover:-translate-y-0.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-tinta">
                    {categoria.emoji ? `${categoria.emoji} ` : ""}
                    {categoria.nome}
                  </h2>
                  <Selo variante="verde">Ativo</Selo>
                </div>
                <p className="text-sm text-tinta-suave">
                  {categoria.descricao ?? `Profissionais de ${categoria.nome} da tua região.`}
                </p>
              </Card>
            </Link>
          ))}

          <Link href="/marketplace/demandas">
            <Card className="flex h-full flex-col gap-2 transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-tinta">Balcão de Demandas</h2>
                <Selo variante="verde">Ativo</Selo>
              </div>
              <p className="text-sm text-tinta-suave">
                Precisa de algo pontual? Publica e quem puder ajudar te procura.
              </p>
            </Card>
          </Link>
        </div>

        <Card className="flex flex-col items-center gap-3 bg-verde/5 text-center">
          <p className="text-base font-semibold text-tinta">
            É profissional e quer aparecer no Marketplace, ou tem algo pontual pra resolver?
          </p>
          <Link href="/app/marketplace" className="w-full sm:w-auto">
            <Botao type="button" className="w-full sm:w-auto">
              Entrar no Quintalzim →
            </Botao>
          </Link>
        </Card>
      </div>
    </div>
  );
}
