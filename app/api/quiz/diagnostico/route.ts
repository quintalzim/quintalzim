import { NextRequest, NextResponse } from "next/server";
import { clienteAdmin } from "@/lib/push-servidor";

const URL_WEBHOOK_N8N = "https://n8n.quintalzim.com.br/webhook/quiz-diagnostico";

export async function POST(request: NextRequest) {
  let corpo: {
    quiz?: string;
    nome?: string;
    email?: string;
    whatsapp?: string | null;
    respostas?: Record<string, string>;
  };

  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "Corpo inválido." }, { status: 400 });
  }

  const { quiz, nome, email, whatsapp, respostas } = corpo;

  if (!quiz || !nome?.trim() || !email?.trim() || !respostas || Object.keys(respostas).length === 0) {
    return NextResponse.json({ erro: "Preenche nome, e-mail e responde o quiz inteiro." }, { status: 400 });
  }

  const segredo = process.env.PUSH_API_SECRET;
  if (!segredo) {
    return NextResponse.json({ erro: "Quiz temporariamente indisponível." }, { status: 500 });
  }

  let diagnostico: string;
  let planoSugerido: string | null = null;

  try {
    const respostaN8n = await fetch(URL_WEBHOOK_N8N, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-push-secret": segredo },
      body: JSON.stringify({ quiz, nome: nome.trim(), respostas }),
    });

    if (!respostaN8n.ok) {
      return NextResponse.json({ erro: "Não consegui montar o diagnóstico agora." }, { status: 502 });
    }

    const dados = await respostaN8n.json();
    diagnostico = dados.diagnostico || "";
    planoSugerido = dados.planoSugerido || null;

    if (!diagnostico) {
      return NextResponse.json({ erro: "Não consegui montar o diagnóstico agora." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ erro: "Não consegui montar o diagnóstico agora." }, { status: 502 });
  }

  const admin = clienteAdmin();
  if (admin) {
    await admin.from("quiz_leads").insert({
      quiz,
      nome: nome.trim(),
      email: email.trim(),
      whatsapp: whatsapp?.trim() || null,
      respostas,
      diagnostico,
      plano_sugerido: planoSugerido,
    });
  }

  return NextResponse.json({ diagnostico, planoSugerido });
}
