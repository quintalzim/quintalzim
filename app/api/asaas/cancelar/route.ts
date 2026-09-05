import { NextResponse } from "next/server";
import { cancelarAssinatura } from "@/lib/asaas";
import { clienteAdmin } from "@/lib/push-servidor";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const admin = clienteAdmin();
  if (!admin) {
    return NextResponse.json({ erro: "Indisponível." }, { status: 500 });
  }

  const { data: assinatura } = await admin
    .from("assinaturas")
    .select("id, asaas_subscription_id")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!assinatura?.asaas_subscription_id) {
    return NextResponse.json({ erro: "Nenhuma assinatura encontrada." }, { status: 404 });
  }

  try {
    await cancelarAssinatura(assinatura.asaas_subscription_id);
  } catch (erro) {
    console.error("Erro ao cancelar assinatura Asaas:", erro);
    return NextResponse.json({ erro: "Não consegui cancelar agora. Tenta de novo." }, { status: 502 });
  }

  await admin
    .from("assinaturas")
    .update({ status: "cancelada", updated_at: new Date().toISOString() })
    .eq("profile_id", user.id);

  return NextResponse.json({ ok: true });
}
