import { NextRequest, NextResponse } from "next/server";
import { buscarClientePorCpf, criarAssinatura, criarCliente, buscarPrimeiraCobranca } from "@/lib/asaas";
import { buscarPlano } from "@/lib/planos";
import { clienteAdmin } from "@/lib/push-servidor";
import { createClient as createServerClient } from "@/lib/supabase/server";

function proximoDiaUtilISO(): string {
  // Asaas exige nextDueDate >= hoje. Usamos amanhã pra dar folga de fuso.
  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  return amanha.toISOString().slice(0, 10);
}

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !user.email) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const cpf = (body?.cpf as string | undefined)?.replace(/\D/g, "");
  const planoId = body?.plano as string | undefined;

  if (!cpf || cpf.length !== 11) {
    return NextResponse.json({ erro: "CPF inválido." }, { status: 400 });
  }

  const plano = planoId ? buscarPlano(planoId) : null;
  if (!plano) {
    return NextResponse.json({ erro: "Plano inválido." }, { status: 400 });
  }

  const admin = clienteAdmin();
  if (!admin) {
    return NextResponse.json({ erro: "Assinatura temporariamente indisponível." }, { status: 500 });
  }

  // Guarda o CPF no perfil (self-service, baixo risco)
  await supabase.from("profiles").update({ cpf }).eq("id", user.id);

  const { data: assinaturaExistente } = await admin
    .from("assinaturas")
    .select("id, status")
    .eq("profile_id", user.id)
    .eq("categoria", plano.categoria)
    .maybeSingle();

  if (assinaturaExistente && assinaturaExistente.status === "ativa") {
    return NextResponse.json(
      { erro: "Você já tem uma assinatura ativa nessa categoria. Cancela a atual antes de trocar." },
      { status: 400 }
    );
  }

  try {
    let clienteAsaas = await buscarClientePorCpf(cpf);
    if (!clienteAsaas) {
      const nome = (user.user_metadata?.name as string | undefined)?.trim() || user.email;
      clienteAsaas = await criarCliente({ name: nome, email: user.email, cpfCnpj: cpf });
    }

    const assinatura = await criarAssinatura({
      customer: clienteAsaas.id,
      value: plano.valor,
      nextDueDate: proximoDiaUtilISO(),
      description: `Quintalzim — ${plano.nome}`,
    });

    await admin.from("assinaturas").upsert(
      {
        profile_id: user.id,
        categoria: plano.categoria,
        asaas_customer_id: clienteAsaas.id,
        asaas_subscription_id: assinatura.id,
        plano: plano.id,
        status: "pendente",
        updated_at: new Date().toISOString(),
      },
      { onConflict: "profile_id,categoria" }
    );

    const primeiraCobranca = await buscarPrimeiraCobranca(assinatura.id);

    return NextResponse.json({
      invoiceUrl: primeiraCobranca?.invoiceUrl ?? null,
    });
  } catch (erro) {
    console.error("Erro ao criar assinatura Asaas:", erro);
    return NextResponse.json(
      { erro: "Não consegui criar a assinatura agora. Tenta de novo em instantes." },
      { status: 502 }
    );
  }
}
