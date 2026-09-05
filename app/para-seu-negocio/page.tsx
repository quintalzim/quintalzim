import type { Metadata } from "next";
import Link from "next/link";
import { planosPorCategoria } from "@/lib/planos";

export const metadata: Metadata = {
  title: "Pro seu negócio — Quintalzim",
  description: "Vitrine, agendamento, catálogo e gestão do seu negócio, tudo num lugar só.",
};

const recursos = [
  {
    emoji: "🖼️",
    titulo: "Vitrine do seu negócio",
    texto:
      "Uma página bonita e simples, pronta em minutos, com um link só pra você mandar pro cliente.",
  },
  {
    emoji: "📅",
    titulo: "Agendamento sozinho",
    texto:
      "O cliente marca o horário direto pela Vitrine, você recebe o aviso e confirma com um toque.",
  },
  {
    emoji: "🛍️",
    titulo: "Catálogo e pedidos",
    texto:
      "Cadastra seus produtos ou serviços e recebe pedidos direto — sem precisar de outro aplicativo de loja.",
  },
  {
    emoji: "📣",
    titulo: "Post novo todo dia",
    texto:
      "Uma publicação pronta pra Instagram, escrita com base no que seu negócio já é — só copiar e postar.",
  },
  {
    emoji: "📊",
    titulo: "Gestão sem contador de plantão",
    texto:
      "Vendas e despesas organizadas automaticamente, com um DRE simples do mês — pra você saber se está no lucro sem abrir planilha.",
  },
  {
    emoji: "🤝",
    titulo: "Marketplace",
    texto:
      "Apareça no diretório de profissionais ou publique/atenda demandas da região — mais um canal de cliente novo.",
  },
];

export default function ParaSeuNegocioPage() {
  const planos = planosPorCategoria("empresa");

  return (
    <div className="flex flex-1 flex-col bg-papel">
      <header className="border-b border-papel-2 px-6 py-5">
        <Link href="/" className="font-titulo text-lg font-extrabold text-terracota">
          quintalzim
        </Link>
      </header>

      <section className="px-6 py-14 text-center">
        <p className="text-sm font-semibold text-terracota">pro seu negócio</p>
        <h1 className="mx-auto mt-2 max-w-lg text-3xl font-extrabold text-tinta sm:text-4xl">
          Sua empresa, redondinha — sem precisar virar tecnólogo
        </h1>
        <p className="mx-auto mt-3 max-w-md text-tinta-suave">
          Vitrine, agendamento, catálogo, posts e gestão financeira, tudo
          plugado no mesmo lugar.
        </p>
      </section>

      <section className="bg-verde-escuro px-6 py-14 text-papel">
        <div className="mx-auto grid max-w-3xl gap-5 sm:grid-cols-2">
          {recursos.map((r) => (
            <div key={r.titulo} className="rounded-2xl bg-white/10 p-5">
              <span className="text-2xl">{r.emoji}</span>
              <h2 className="mt-2 font-titulo text-base font-bold text-papel">{r.titulo}</h2>
              <p className="mt-1 text-sm text-papel/85">{r.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-14">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-titulo text-2xl font-extrabold text-tinta">Quanto custa</h2>
          <p className="mt-2 text-sm text-tinta-suave">
            Escolhe o plano que faz sentido pro tamanho do seu negócio hoje — dá pra
            trocar depois.
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

      <section className="bg-papel-2 px-6 py-14 text-center">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4">
          <h2 className="font-titulo text-2xl font-extrabold text-tinta">Vamos nessa?</h2>
          <p className="text-sm text-tinta-suave">
            Cria sua conta, depois é só cadastrar sua Empresa dentro do portal — leva
            poucos minutos.
          </p>
          <Link
            href="/entrar?aba=criar"
            className="inline-flex items-center justify-center rounded-lg bg-terracota px-6 py-3 font-titulo text-base font-semibold text-papel shadow-[0_4px_0_0_var(--terracota-escuro)] transition-all active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--terracota-escuro)]"
          >
            Criar minha conta grátis
          </Link>
          <Link href="/para-voce" className="text-sm font-semibold text-verde-escuro underline underline-offset-2">
            Quero ver o lado pessoal →
          </Link>
        </div>
      </section>
    </div>
  );
}
