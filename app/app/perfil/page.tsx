import BotaoSairQuintal from "@/components/app/BotaoSairQuintal";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/server";

export default async function PerfilPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nome = (user?.user_metadata?.name as string | undefined)?.trim() || "Sem nome ainda";

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Perfil</h1>
        <p className="text-tinta-suave">Seus dados e sua assinatura.</p>
      </div>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Seus dados</Selo>
        <div>
          <p className="text-xs font-semibold text-tinta-suave">Nome</p>
          <p className="text-lg font-bold text-tinta">{nome}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-tinta-suave">E-mail</p>
          <p className="text-lg font-bold text-tinta">{user?.email}</p>
        </div>
      </Card>

      <Card className="flex flex-col gap-2">
        <Selo variante="terracota">Em breve</Selo>
        <h2 className="text-lg font-bold text-tinta">Minha assinatura</h2>
        <p className="text-sm text-tinta-suave">
          Plano, cobrança e histórico de pagamentos.
        </p>
      </Card>

      <BotaoSairQuintal />
    </div>
  );
}
