const itensPessoais = [
  "Finanças no WhatsApp: fala o gasto, tá anotado",
  "Calorias pela foto do prato",
  "Plano de hábitos que cabe na sua rotina",
  "Resumo do dia, todo dia, do jeito que você gosta",
  "Ferramentas úteis pra usar sem pensar duas vezes",
];

const itensNegocio = [
  "Página bonita do seu negócio, pronta em minutos",
  "Cliente agenda sozinho, você só confirma",
  "Post novo todo dia nas suas redes",
  "Vendas e contas organizadas sem contador de plantão",
  "Tudo isso por menos que um dia de faturamento",
];

export default function PortoesSection() {
  return (
    <section className="px-6 py-14">
      <div className="mx-auto max-w-4xl">
        <p className="mx-auto mb-10 max-w-lg text-center text-lg font-semibold text-tinta">
          Pra sua vida ou pro seu negócio — você entra pelo portão que
          quiser, e tudo funciona junto.
        </p>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-6 shadow-[var(--shadow-quintal)]">
            <p className="text-sm font-semibold text-terracota">pra você</p>
            <h3 className="mb-4 font-titulo text-xl font-extrabold text-tinta">
              Sua vida, mais leve
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-tinta-suave">
              {itensPessoais.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">🌱</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl bg-verde-escuro p-6 text-papel shadow-[var(--shadow-quintal)]">
            <p className="text-sm font-semibold text-amarelo">pro seu negócio</p>
            <h3 className="mb-4 font-titulo text-xl font-extrabold text-papel">
              Sua empresa, redondinha
            </h3>
            <ul className="flex flex-col gap-2.5 text-sm text-papel/90">
              {itensNegocio.map((item) => (
                <li key={item} className="flex gap-2">
                  <span aria-hidden="true">✅</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
