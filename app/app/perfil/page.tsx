import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

export default function PerfilPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Perfil</h1>
        <p className="text-tinta-suave">Seus dados e sua assinatura.</p>
      </div>

      <Card className="flex flex-col gap-2">
        <Selo variante="verde">Em breve</Selo>
        <h2 className="text-lg font-bold text-tinta">Meus dados</h2>
        <p className="text-sm text-tinta-suave">
          Nome, e-mail e cidade vão aparecer por aqui.
        </p>
      </Card>

      <Card className="flex flex-col gap-2">
        <Selo variante="terracota">Em breve</Selo>
        <h2 className="text-lg font-bold text-tinta">Minha assinatura</h2>
        <p className="text-sm text-tinta-suave">
          Plano, cobrança e histórico de pagamentos.
        </p>
      </Card>
    </div>
  );
}
