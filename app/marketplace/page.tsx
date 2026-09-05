import Link from "next/link";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

export default function MarketplacePage() {
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
          <Link href="/marketplace/personal-trainer">
            <Card className="flex h-full flex-col gap-2 transition-transform hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-tinta">Personal Trainers</h2>
                <Selo variante="verde">Ativo</Selo>
              </div>
              <p className="text-sm text-tinta-suave">
                Diretório de profissionais fitness pra te ajudar com o plano de hábitos.
              </p>
            </Card>
          </Link>

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

        <Card className="flex flex-col gap-2">
          <p className="text-sm text-tinta-suave">
            É profissional e quer aparecer no Marketplace, ou tem algo pontual pra resolver?
          </p>
          <Link
            href="/app/marketplace"
            className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            Entra no Quintalzim →
          </Link>
        </Card>
      </div>
    </div>
  );
}
