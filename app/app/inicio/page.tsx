import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { createClient } from "@/lib/supabase/server";

function formatarDataHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function InicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: briefing } = user
    ? await supabase
        .from("briefings_financeiros")
        .select("mensagem, created_at")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Início</h1>
        <p className="text-tinta-suave">Seus destaques por aqui, prontinho.</p>
      </div>

      <Card className="flex flex-col gap-2">
        <Selo variante="verde">Resumo do dia</Selo>
        {briefing ? (
          <>
            <p className="text-xs text-tinta-suave">{formatarDataHora(briefing.created_at)}</p>
            <p className="whitespace-pre-wrap text-sm text-tinta">{briefing.mensagem}</p>
          </>
        ) : (
          <p className="text-sm text-tinta-suave">
            Assim que você tiver movimento no Quintal de Finanças, o Prontim monta um resumo aqui
            todo dia.
          </p>
        )}
      </Card>

      <Card className="flex flex-col gap-2">
        <Selo variante="verde">Em breve</Selo>
        <h2 className="text-lg font-bold text-tinta">Seus mini-apps favoritos</h2>
        <p className="text-sm text-tinta-suave">
          Acesso rápido para o que você mais usa no Quintalzim.
        </p>
      </Card>
    </div>
  );
}
