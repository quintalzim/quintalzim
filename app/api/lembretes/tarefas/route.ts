import { NextRequest, NextResponse } from "next/server";
import { clienteAdmin, configurarWebPush, enviarPushParaProfile } from "@/lib/push-servidor";

// Chamada só por automação de servidor (n8n, com Schedule Trigger), nunca
// pelo navegador — mesma autorização via PUSH_API_SECRET usada em
// /api/lembretes/agendamentos. Varre tarefas com prazo, não concluídas, que
// estão entrando na janela de 2h antes do prazo e ainda não tiveram lembrete
// mandado, dispara o push e marca a flag pra não repetir na próxima rodada.

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
  const limite = new Date(agora.getTime() + 2 * 60 * 60 * 1000);

  const { data: tarefas, error } = await admin
    .from("itens_lista")
    .select("id, profile_id, texto, prazo")
    .eq("tipo", "tarefa")
    .eq("concluido", false)
    .eq("lembrete_enviado", false)
    .not("prazo", "is", null)
    .gt("prazo", agora.toISOString())
    .lte("prazo", limite.toISOString());

  if (error || !tarefas) {
    return NextResponse.json({ ok: true, enviados: 0 });
  }

  let enviados = 0;
  for (const tarefa of tarefas) {
    await enviarPushParaProfile(
      admin,
      tarefa.profile_id,
      "Lembrete: Tarefa",
      `${tarefa.texto} — prazo ${formatarDataHora(tarefa.prazo)}. Prontim ✅`,
      "/app/tarefas"
    );

    await admin.from("itens_lista").update({ lembrete_enviado: true }).eq("id", tarefa.id);
    enviados += 1;
  }

  return NextResponse.json({ ok: true, enviados });
}
