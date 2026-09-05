import { NextResponse } from "next/server";
import { sincronizarStatusAssinatura } from "@/lib/asaas";
import { clienteAdmin } from "@/lib/push-servidor";
import { createClient as createServerClient } from "@/lib/supabase/server";

// Fallback manual: consulta o Asaas direto (em vez de esperar o webhook) e
// atualiza o status da assinatura. Útil quando o webhook não foi configurado
// a tempo ou falhou por qualquer motivo.
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
    .select("asaas_subscription_id, status")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!assinatura?.asaas_subscription_id) {
    return NextResponse.json({ erro: "Nenhuma assinatura encontrada." }, { status: 404 });
  }

  try {
    const statusAtualizado = await sincronizarStatusAssinatura(assinatura.asaas_subscription_id);

    if (statusAtualizado !== assinatura.status) {
      await admin
        .from("assinaturas")
        .update({ status: statusAtualizado, updated_at: new Date().toISOString() })
        .eq("profile_id", user.id);
    }

    return NextResponse.json({ status: statusAtualizado });
  } catch (erro) {
    console.error("Erro ao sincronizar assinatura Asaas:", erro);
    return NextResponse.json({ erro: "Não consegui checar agora. Tenta de novo." }, { status: 502 });
  }
}
