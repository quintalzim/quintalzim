import { NextRequest, NextResponse } from "next/server";
import { clienteAdmin, configurarWebPush, enviarPushParaProfile } from "@/lib/push-servidor";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const profileId = body?.profileId as string | undefined;
  const agendamentoId = body?.agendamentoId as string | undefined;
  const titulo = (body?.titulo as string | undefined) || "Quintalzim";
  const corpo = (body?.corpo as string | undefined) || "";
  const url = (body?.url as string | undefined) || "/app/inicio";

  if (!profileId) {
    return NextResponse.json({ error: "profileId é obrigatório" }, { status: 400 });
  }

  const admin = clienteAdmin();
  if (!admin) {
    return NextResponse.json({ error: "Push não configurado no servidor" }, { status: 500 });
  }

  const segredoEsperado = process.env.PUSH_API_SECRET;
  const segredoRecebido = request.headers.get("x-push-secret");
  const autorizadoPorSegredo = Boolean(segredoEsperado) && segredoRecebido === segredoEsperado;

  if (!autorizadoPorSegredo) {
    const supabase = await createServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Caso comum: usuário mandando um push pra si mesmo (ex: teste de avisos).
    let autorizado = user.id === profileId;

    // Caso Empresa: dono confirmando/recusando o agendamento de um cliente —
    // profileId é do cliente, então autoriza só se o agendamento informado é
    // desse cliente E pertence a uma empresa desse dono (checado com o client
    // admin, que ignora RLS, já que aqui quem decide é essa checagem manual).
    if (!autorizado && agendamentoId) {
      const { data: agendamento } = await admin
        .from("agendamentos")
        .select("cliente_profile_id, empresas(owner_id)")
        .eq("id", agendamentoId)
        .maybeSingle();

      const empresaDoAgendamento = Array.isArray(agendamento?.empresas)
        ? agendamento.empresas[0]
        : agendamento?.empresas;

      autorizado = Boolean(
        agendamento &&
          agendamento.cliente_profile_id === profileId &&
          empresaDoAgendamento?.owner_id === user.id
      );
    }

    if (!autorizado) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }

  if (!configurarWebPush()) {
    return NextResponse.json({ error: "Push não configurado no servidor" }, { status: 500 });
  }

  const resultado = await enviarPushParaProfile(admin, profileId, titulo, corpo, url);
  return NextResponse.json(resultado);
}
