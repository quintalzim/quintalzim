import { NextRequest, NextResponse } from "next/server";
import { clienteAdmin, configurarWebPush, enviarPushParaProfile } from "@/lib/push-servidor";

// Chamada só por automação de servidor (n8n, com Schedule Trigger), nunca
// pelo navegador — por isso a única autorização aceita é o PUSH_API_SECRET.
// Varre agendamentos confirmados que estão entrando na janela de 24h ou 2h
// antes do horário desejado e ainda não tiveram lembrete daquele tipo
// mandado, dispara o push e marca a flag pra não repetir na próxima rodada.

type EmpresaEmbutida = { nome: string | null } | { nome: string | null }[] | null;

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

function nomeDaEmpresa(empresas: EmpresaEmbutida): string {
  const empresa = Array.isArray(empresas) ? empresas[0] : empresas;
  return empresa?.nome || "Quintalzim";
}

export async function POST(request: NextRequest) {
  const segredoEsperado = process.env.PUSH_API_SECRET;
  const segredoRecebido = request.headers.get("x-push-secret");

  if (!segredoEsperado || segredoRecebido !== segredoEsperado) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  if (!configurarWebPush()) {
    return NextResponse.json({ error: "Push não configurado no servidor" }, { status: 500 });
  }

  const admin = clienteAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Push não configurado no servidor" }, { status: 500 });
  }

  const agora = new Date();
  const janelas = [
    {
      campo: "lembrete_2h_enviado" as const,
      limite: new Date(agora.getTime() + 2 * 60 * 60 * 1000),
      rotulo: "2h" as const,
      quando: "daqui a 2 horas",
    },
    {
      campo: "lembrete_24h_enviado" as const,
      limite: new Date(agora.getTime() + 24 * 60 * 60 * 1000),
      rotulo: "24h" as const,
      quando: "amanhã",
    },
  ];

  const resultado: Record<string, number> = { "2h": 0, "24h": 0 };

  for (const janela of janelas) {
    const { data: agendamentos, error } = await admin
      .from("agendamentos")
      .select("id, cliente_profile_id, servico, data_hora_desejada, empresas(nome)")
      .eq("status", "confirmado")
      .eq(janela.campo, false)
      .gt("data_hora_desejada", agora.toISOString())
      .lte("data_hora_desejada", janela.limite.toISOString());

    if (error || !agendamentos) continue;

    for (const agendamento of agendamentos) {
      await enviarPushParaProfile(
        admin,
        agendamento.cliente_profile_id,
        `Lembrete: ${nomeDaEmpresa(agendamento.empresas)}`,
        `${agendamento.servico || "Teu horário"} é ${janela.quando} (${formatarDataHora(agendamento.data_hora_desejada)}). Prontim ✅`
      );

      await admin.from("agendamentos").update({ [janela.campo]: true }).eq("id", agendamento.id);
      resultado[janela.rotulo] += 1;
    }
  }

  return NextResponse.json({ ok: true, ...resultado });
}
