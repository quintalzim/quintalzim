import { NextRequest, NextResponse } from "next/server";
import { clienteAdmin, configurarWebPush, enviarPushParaProfile } from "@/lib/push-servidor";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const profileId = body?.profileId as string | undefined;
  const agendamentoId = body?.agendamentoId as string | undefined;
  const pedidoCatalogoId = body?.pedidoCatalogoId as string | undefined;
  const empresaId = body?.empresaId as string | undefined;
  const demandaId = body?.demandaId as string | undefined;
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

    // Caso dono → cliente (catálogo): dono confirmando/recusando pedido do
    // Catálogo avisa o cliente — mesmo padrão do agendamentoId acima.
    if (!autorizado && pedidoCatalogoId) {
      const { data: pedido } = await admin
        .from("pedidos_catalogo")
        .select("cliente_profile_id, empresas(owner_id)")
        .eq("id", pedidoCatalogoId)
        .maybeSingle();

      const empresaDoPedido = Array.isArray(pedido?.empresas) ? pedido.empresas[0] : pedido?.empresas;

      autorizado = Boolean(
        pedido && pedido.cliente_profile_id === profileId && empresaDoPedido?.owner_id === user.id
      );
    }

    // Caso cliente → dono: cliente pedindo horário/item do catálogo avisa o
    // dono da Empresa. profileId aqui é do DONO, então autoriza só se de fato
    // é o owner_id dessa empresa E quem está chamando tem vínculo real com
    // ela (empresa_clientes) — evita que qualquer usuário logado dispare
    // push pra dono de empresa que não é cliente.
    if (!autorizado && empresaId) {
      const { data: empresa } = await admin
        .from("empresas")
        .select("owner_id")
        .eq("id", empresaId)
        .maybeSingle();

      const { data: vinculo } = await admin
        .from("empresa_clientes")
        .select("empresa_id")
        .eq("empresa_id", empresaId)
        .eq("profile_id", user.id)
        .maybeSingle();

      autorizado = Boolean(empresa && empresa.owner_id === profileId && vinculo);
    }

    // Caso Marketplace: profissional manifestando interesse avisa o autor da
    // demanda, ou o autor avisando o profissional interessado que foi
    // escolhido. Autoriza se profileId é de fato uma das duas pontas da
    // demanda e quem chama é a outra ponta.
    if (!autorizado && demandaId) {
      const { data: demanda } = await admin
        .from("demandas_marketplace")
        .select("autor_profile_id")
        .eq("id", demandaId)
        .maybeSingle();

      if (demanda) {
        const chamadorEhAutor = demanda.autor_profile_id === user.id;
        const chamadorEhInteressado = !chamadorEhAutor
          ? Boolean(
              (
                await admin
                  .from("interesses_demanda")
                  .select("id")
                  .eq("demanda_id", demandaId)
                  .eq("profissional_profile_id", user.id)
                  .maybeSingle()
              ).data
            )
          : false;

        if (chamadorEhAutor) {
          // Autor só pode notificar quem de fato demonstrou interesse
          const { data: interesse } = await admin
            .from("interesses_demanda")
            .select("id")
            .eq("demanda_id", demandaId)
            .eq("profissional_profile_id", profileId)
            .maybeSingle();
          autorizado = Boolean(interesse);
        } else if (chamadorEhInteressado) {
          autorizado = demanda.autor_profile_id === profileId;
        }
      }
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
