import Link from "next/link";
import MockupTelefone from "@/components/landing/MockupTelefone";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { nivelPF } from "@/lib/assinaturas";
import { planosPorCategoria } from "@/lib/planos";
import { createClient } from "@/lib/supabase/server";

const RECURSOS = [
  {
    emoji: "💰",
    titulo: "Quintal de Finanças",
    texto: "Suas contas em ordem, sem planilha — lançamentos, categorias, visão do mês.",
    minimo: "base" as const,
  },
  {
    emoji: "📝",
    titulo: "Tarefas & Lista de Compras",
    texto: "Digita ou fala e o Prontim organiza em tarefa ou compra pra você.",
    minimo: "base" as const,
  },
  {
    emoji: "💬",
    titulo: "Chat com o Prontim",
    texto: "Conversa direto no portal — pergunta, registra, tira dúvida.",
    minimo: "base" as const,
  },
  {
    emoji: "🤝",
    titulo: "Marketplace",
    texto: "Balcão de Demandas pra pedir ajuda pontual ou topar ajudar alguém, e o diretório de Personal Trainers da região.",
    minimo: "base" as const,
  },
  {
    emoji: "☀️",
    titulo: "Briefings do Dia",
    texto: "Resumo pronto todo dia de manhã: financeiro, tarefas em aberto, o que importa.",
    minimo: "base" as const,
  },
  {
    emoji: "📸",
    titulo: "Prontim no WhatsApp",
    texto:
      "Registra despesa falando ou escrevendo, manda foto do prato pra saber as calorias, organiza tarefa e compra por lá — tudo direto no zap.",
    minimo: "premium" as const,
  },
  {
    emoji: "⭐",
    titulo: "Virar Profissional no Marketplace",
    texto:
      "Cria teu perfil público no diretório de Personal Trainers e apareça na recomendação da IA no plano de hábitos do Quiz-Funil.",
    minimo: "premium" as const,
  },
] satisfies { emoji: string; titulo: string; texto: string; minimo: "base" | "premium" }[];

export default async function ParaVoceAppPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nivel = user ? await nivelPF(supabase, user.id) : "nenhum";
  const planos = planosPorCategoria("pf");

  return (
    <div className="mx-auto flex max-w-md flex-col gap-6">
      <div className="text-center">
        <Selo variante="verde">Pra você</Selo>
        <h1 className="mt-2 text-2xl font-extrabold text-tinta">
          Tudo que o Quintalzim faz por quem assina
        </h1>
        <p className="mt-1 text-tinta-suave">
          Criar conta é grátis. Essas funcionalidades ficam completas com a assinatura.
        </p>
      </div>

      <div className="flex justify-center">
        <MockupTelefone>
          <div className="flex flex-col gap-3 px-3">
            <div>
              <p className="text-[11px] font-semibold text-tinta-suave">quintalzim</p>
              <h3 className="text-lg font-extrabold text-tinta">Início</h3>
              <p className="text-[11px] text-tinta-suave">Seus destaques por aqui, prontinho.</p>
            </div>
            <div className="rounded-xl bg-white p-3 shadow-[var(--shadow-quintal-sm)]">
              <span className="inline-flex rounded-full bg-verde/10 px-2 py-0.5 text-[10px] font-semibold text-verde-escuro">
                Resumo do dia
              </span>
              <p className="mt-2 text-[11px] leading-relaxed text-tinta">
                Ontem você registrou R$ 84,90 em despesas, principalmente com mercado. Prontim ✅
              </p>
            </div>
            <div className="rounded-xl bg-white p-3 shadow-[var(--shadow-quintal-sm)]">
              <span className="inline-flex rounded-full bg-amarelo/20 px-2 py-0.5 text-[10px] font-semibold text-[#7a5417]">
                Pendências
              </span>
              <p className="mt-2 text-[11px] leading-relaxed text-tinta">
                Tarefas em aberto (2) • Lista de compras (4)
              </p>
            </div>
          </div>
        </MockupTelefone>
      </div>

      <div className="flex flex-col gap-3">
        {RECURSOS.map((r) => (
          <Card key={r.titulo} className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <p className="font-titulo text-base font-bold text-tinta">
                {r.emoji} {r.titulo}
              </p>
              <Selo variante={r.minimo === "premium" ? "amarelo" : "verde"}>
                {r.minimo === "premium" ? "Premium" : "Base"}
              </Selo>
            </div>
            <p className="text-sm text-tinta-suave">{r.texto}</p>
          </Card>
        ))}
      </div>

      <Card className="flex flex-col gap-4">
        <div className="text-center">
          <p className="font-titulo text-lg font-bold text-tinta">Os planos</p>
          <p className="text-sm text-tinta-suave">
            Base libera o portal inteiro. Premium soma o Prontim no WhatsApp.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {planos.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between rounded-xl border-2 border-papel-2 bg-white p-4"
            >
              <div>
                <p className="font-titulo font-bold text-tinta">{p.nome}</p>
                <p className="text-xs text-tinta-suave">{p.descricao}</p>
              </div>
              <p className="shrink-0 font-bold text-verde-escuro">R$ {p.valor}/mês</p>
            </div>
          ))}
        </div>
        {nivel === "premium" ? (
          <p className="rounded-lg bg-verde/10 px-4 py-3 text-center text-sm font-semibold text-verde-escuro">
            Você já tem o Premium — tudo liberado. Prontim ✅
          </p>
        ) : (
          <Link href="/app/perfil">
            <Botao type="button" className="w-full">
              {nivel === "base" ? "Fazer upgrade pra Premium" : "Assinar agora"}
            </Botao>
          </Link>
        )}
      </Card>
    </div>
  );
}
