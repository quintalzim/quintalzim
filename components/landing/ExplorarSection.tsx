import Link from "next/link";

const itens = [
  {
    href: "/ferramentas",
    emoji: "🧰",
    titulo: "Ferramentas grátis",
    descricao:
      "Calculadora de juros, preço de serviço, gerador de recibo, bio com IA e conversor de extrato — sem precisar de conta.",
  },
  {
    href: "/quiz/saude-fitness",
    emoji: "🧭",
    titulo: "Diagnóstico de saúde e hábitos",
    descricao:
      "Um quiz rápido que monta um plano de hábitos sob medida pra sua rotina.",
  },
  {
    href: "/marketplace",
    emoji: "🤝",
    titulo: "Marketplace",
    descricao:
      "Encontre um personal trainer perto de você ou publique o que você precisa no Balcão de Demandas.",
  },
];

export default function ExplorarSection() {
  return (
    <section className="px-6 py-16">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 text-center">
          <h2 className="font-titulo text-2xl font-extrabold text-tinta sm:text-3xl">
            Dá pra experimentar sem nem criar conta
          </h2>
          <p className="mx-auto mt-2 max-w-md text-tinta-suave">
            Um gostinho do Quintalzim, aberto pra qualquer um.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3">
          {itens.map((item) => (
            <Link key={item.href} href={item.href} className="group">
              <div className="flex h-full flex-col gap-3 rounded-2xl bg-white p-5 text-left shadow-[var(--shadow-quintal)] transition-transform group-hover:-translate-y-1">
                <span className="text-2xl">{item.emoji}</span>
                <h3 className="font-titulo text-base font-bold text-tinta">{item.titulo}</h3>
                <p className="text-sm text-tinta-suave">{item.descricao}</p>
                <span className="mt-auto pt-1 text-sm font-semibold text-verde-escuro underline underline-offset-2 group-hover:no-underline">
                  Experimentar →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
