import AtivarNotificacoes from "@/components/app/AtivarNotificacoes";
import BotaoSairQuintal from "@/components/app/BotaoSairQuintal";
import DesbloquearPortalCompleto from "@/components/app/DesbloquearPortalCompleto";
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

function rotuloStatus(status: string): string {
  if (status === "confirmado") return "Confirmado ✅";
  if (status === "recusado") return "Não foi dessa vez";
  return "Aguardando confirmação";
}

export default async function PortalRestritoClienteFinal() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: agendamentos } = user
    ? await supabase
        .from("agendamentos")
        .select("id, servico, data_hora_desejada, status, empresas(nome)")
        .eq("cliente_profile_id", user.id)
        .order("data_hora_desejada", { ascending: false })
    : { data: [] };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Meus pedidos</h1>
        <p className="text-tinta-suave">Os horários que você pediu pelo Quintalzim.</p>
      </div>

      <Card className="flex flex-col gap-3">
        {!agendamentos || agendamentos.length === 0 ? (
          <p className="text-sm text-tinta-suave">
            Você ainda não pediu nenhum horário. Volta no link do negócio que te mandou aqui pra
            pedir.
          </p>
        ) : (
          agendamentos.map((agendamento) => {
            const empresaInfo = Array.isArray(agendamento.empresas)
              ? agendamento.empresas[0]
              : agendamento.empresas;
            return (
              <div key={agendamento.id} className="flex flex-col gap-1 border-b border-papel-2 pb-3 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-tinta">
                    {(empresaInfo as { nome?: string } | null)?.nome ?? "Negócio"}
                  </p>
                  <Selo variante={agendamento.status === "confirmado" ? "verde" : "terracota"}>
                    {rotuloStatus(agendamento.status)}
                  </Selo>
                </div>
                <p className="text-sm text-tinta-suave">
                  {agendamento.servico || "Sem detalhe"} —{" "}
                  {formatarDataHora(agendamento.data_hora_desejada)}
                </p>
              </div>
            );
          })
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Avisos</Selo>
        <p className="text-sm text-tinta-suave">
          Ativa as notificações pra saber na hora quando confirmarem teu horário.
        </p>
        <AtivarNotificacoes />
      </Card>

      <DesbloquearPortalCompleto />

      <BotaoSairQuintal />
    </div>
  );
}
