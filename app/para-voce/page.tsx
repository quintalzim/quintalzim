import type { Metadata } from "next";
import Link from "next/link";
import MockupTelefone from "@/components/landing/MockupTelefone";
import { planosPorCategoria } from "@/lib/planos";

export const metadata: Metadata = {
  title: "Pra você — Quintalzim",
  description: "Organize suas finanças, sua saúde e sua rotina com o Prontim ao seu lado.",
};

const recursos = [
  {
    emoji: "💸",
    titulo: "Finanças sem planilha",
    texto:
      "Fala \"gastei 25 no mercado\" pro Prontim e pronto: tá anotado, categorizado e somado. No fim do mês você já sabe onde o dinheiro foi.",
  },
  {
    emoji: "📸",
    titulo: "Calorias pela foto do prato",
    texto:
      "Manda a foto do que você comeu e o Prontim estima as calorias na hora — sem precisar pesar nada ou abrir outro aplicativo.",
  },
  {
    emoji: "🧭",
    titulo: "Plano de hábitos sob medida",
    texto:
      "Um quiz rápido sobre sua rotina, sono e alimentação vira um plano de hábitos realista — feito pra encaixar na sua vida, não o contrário.",
  },
  {
    emoji: "☀️",
    titulo: "Resumo do dia, todo dia",
    texto:
      "Um briefing direto no WhatsApp com o que importa: quanto você gastou, o que falta fazer, sem enrolação.",
  },
  {
    emoji: "🧰",
    titulo: "Ferramentas prontas",
    texto:
      "Calculadora de juros, gerador de recibo e outros utilitários do dia a dia, sem precisar nem estar logado.",
  },
];

export default function ParaVocePage() {
  const planos = planosPorCategoria("pf");

  return (
    <div className="flex flex-1 flex-col bg-papel">
      <header className="border-b border-papel-2 px-6 py-5">
        <Link href="/" className="font-titulo text-lg font-extrabold text-terracota">
          quintalzim
        </Link>
      </header>

      <section className="px-6 py-14 text-center">
        <p className="text-sm font-semibold text-terracota">pra você</p>
        <h1 className="mx-auto mt-2 max-w-lg text-3xl font-extrabold text-tinta sm:text-4xl">
          Sua vida, mais leve — com um vizinho que resolve
        </h1>
        <p className="mx-auto mt-3 max-w-md text-tinta-suave">
          O Prontim cuida das coisas chatas do dia a dia pra você sobrar tempo
          pro que importa.
        </p>
      </section>

      <section className="px-6 py-6">
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-8">
          <MockupTelefone>
            <div className="flex flex-col gap-4 px-3">
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
                  Ontem você registrou R$ 84,90 em despesas, principalmente com mercado. Já
                  separei por categoria pra você não perder o fio. Prontim ✅
                </p>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-[var(--shadow-quintal-sm)]">
                <span className="inline-flex rounded-full bg-amarelo/20 px-2 py-0.5 text-[10px] font-semibold text-[#7a5417]">
                  Plano de hábitos
                </span>
                <p className="mt-2 text-[11px] leading-relaxed text-tinta">
                  Hoje: 30 min de caminhada e 2L de água. Você já bateu 4 de 7 dias essa
                  semana 🌱
                </p>
              </div>
            </div>
          </MockupTelefone>

          <MockupTelefone>
            <div className="flex flex-col gap-3 px-3">
              <div>
                <p className="text-[11px] font-semibold text-tinta-suave">quintalzim</p>
                <h3 className="text-lg font-extrabold text-tinta">Catálogo</h3>
                <p className="text-[11px] text-tinta-suave">Todos os mini-apps num lugar só.</p>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-[var(--shadow-quintal-sm)]">
                <p className="text-sm font-bold text-tinta">Quintal de Finanças 🌱</p>
                <p className="mt-1 text-[11px] text-tinta-suave">Suas contas em ordem sem complicação</p>
                <div className="mt-2 rounded-lg bg-terracota py-1.5 text-center text-[11px] font-semibold text-papel">
                  Abrir
                </div>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-[var(--shadow-quintal-sm)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-tinta">Calorias por Foto 📸</p>
                  <span className="rounded-full bg-verde/10 px-2 py-0.5 text-[10px] font-semibold text-verde-escuro">
                    Ativo
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-tinta-suave">Manda a foto, o Prontim estima na hora</p>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-[var(--shadow-quintal-sm)]">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-tinta">Briefings do Dia ☀️</p>
                  <span className="rounded-full bg-verde/10 px-2 py-0.5 text-[10px] font-semibold text-verde-escuro">
                    Ativo
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-tinta-suave">Um resumo pronto, todo dia de manhã</p>
              </div>
            </div>
          </MockupTelefone>
        </div>
      </section>

      <section className="bg-papel-2 px-6 py-14">
        <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
          {recursos.map((r) => (
            <div key={r.titulo} className="rounded-2xl bg-white p-5 shadow-[var(--shadow-quintal)]">
              <span className="text-2xl">{r.emoji}</span>
              <h2 className="mt-2 font-titulo text-base font-bold text-tinta">{r.titulo}</h2>
              <p className="mt-1 text-sm text-tinta-suave">{r.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-titulo text-2xl font-extrabold text-tinta">Quanto custa</h2>
          <p className="mt-2 text-sm text-tinta-suave">
            Criar conta é grátis. Assinar é opcional, pra quem quer o acompanhamento completo.
          </p>
          <div className="mt-6 flex flex-col gap-3">
            {planos.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between rounded-xl border-2 border-papel-2 bg-white p-4 text-left"
              >
                <div>
                  <p className="font-titulo font-bold text-tinta">{p.nome}</p>
                  <p className="text-xs text-tinta-suave">{p.descricao}</p>
                </div>
                <p className="shrink-0 font-bold text-verde-escuro">R$ {p.valor}/mês</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-verde-escuro px-6 py-14 text-center text-papel">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <h2 className="font-titulo text-2xl font-extrabold">Vamos nessa?</h2>
          <Link
            href="/entrar?aba=criar"
            className="inline-flex items-center justify-center rounded-lg bg-amarelo px-6 py-3 font-titulo text-base font-semibold text-[#4a3510] shadow-[0_4px_0_0_#c98f1f] transition-all active:translate-y-[3px] active:shadow-[0_1px_0_0_#c98f1f]"
          >
            Criar minha conta grátis
          </Link>
          <Link href="/para-seu-negocio" className="text-sm font-semibold text-papel/80 underline underline-offset-2">
            Tenho um negócio, quero ver o outro lado →
          </Link>
        </div>
      </section>
    </div>
  );
}
