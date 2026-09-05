import { NextRequest, NextResponse } from "next/server";
import { clienteAdmin } from "@/lib/push-servidor";

// Webhook do Asaas — configurar manualmente no painel (Configurações →
// Integrações → Webhooks), apontando pra
// https://quintalzim.com.br/api/asaas/webhook, com o mesmo valor de
// ASAAS_WEBHOOK_TOKEN como "Token de acesso" (Asaas devolve esse token no
// header `asaas-access-token` em toda chamada, é como validamos que a
// chamada é de fato do Asaas).

const EVENTOS_ATIVA = ["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"];
const EVENTOS_INADIMPLENTE = ["PAYMENT_OVERDUE"];

export async function POST(request: NextRequest) {
  const tokenEsperado = process.env.ASAAS_WEBHOOK_TOKEN;
  const tokenRecebido = request.headers.get("asaas-access-token");

  if (!tokenEsperado || tokenRecebido !== tokenEsperado) {
    return NextResponse.json({ erro: "Não autorizado." }, { status: 401 });
  }

  const corpo = await request.json().catch(() => null);
  const evento = corpo?.event as string | undefined;
  const payment = corpo?.payment as { customer?: string; subscription?: string } | undefined;

  // Casa pelo asaas_subscription_id, não pelo customer: desde que a escada de
  // planos ficou completa, um mesmo cliente Asaas (mesmo CPF) pode ter várias
  // assinaturas nossas ao mesmo tempo (PF + Empresa + Profissional), cada
  // uma com seu próprio subscription id.
  if (!evento || !payment?.subscription) {
    return NextResponse.json({ ok: true }); // evento que não precisamos tratar
  }

  const admin = clienteAdmin();
  if (!admin) {
    return NextResponse.json({ erro: "Indisponível." }, { status: 500 });
  }

  let novoStatus: string | null = null;
  if (EVENTOS_ATIVA.includes(evento)) novoStatus = "ativa";
  else if (EVENTOS_INADIMPLENTE.includes(evento)) novoStatus = "inadimplente";

  if (!novoStatus) {
    return NextResponse.json({ ok: true });
  }

  await admin
    .from("assinaturas")
    .update({ status: novoStatus, updated_at: new Date().toISOString() })
    .eq("asaas_subscription_id", payment.subscription);

  return NextResponse.json({ ok: true });
}
