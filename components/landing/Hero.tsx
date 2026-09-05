import Link from "next/link";

export default function Hero() {
  return (
    <section className="flex flex-col items-center gap-5 px-6 pb-14 pt-10 text-center">
      <span className="inline-flex items-center rounded-full border-2 border-dashed border-verde bg-verde/5 px-4 py-1.5 text-sm font-semibold text-verde-escuro">
        🌱 já no ar — pode entrar
      </span>

      <h1 className="max-w-lg text-4xl font-extrabold leading-tight text-tinta sm:text-5xl">
        O <span className="text-terracota">Quintalzim</span> resolve pela sua vida e pelo seu negócio
      </h1>

      <p className="max-w-md text-base text-tinta-suave sm:text-lg">
        Um lugar só, com o Prontim ao seu lado, pra organizar as contas, marcar
        os compromissos e tocar o dia a dia — sem baixar dez aplicativos, sem
        tecniquês, sem frescura.
      </p>

      <div className="flex flex-col gap-3 pt-2 sm:flex-row">
        <Link
          href="/entrar?aba=criar"
          className="inline-flex items-center justify-center rounded-lg bg-terracota px-6 py-3 font-titulo text-base font-semibold text-papel shadow-[0_4px_0_0_var(--terracota-escuro)] transition-all active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--terracota-escuro)]"
        >
          Criar minha conta grátis
        </Link>
        <Link
          href="/entrar"
          className="inline-flex items-center justify-center rounded-lg border-2 border-verde bg-transparent px-6 py-3 font-titulo text-base font-semibold text-verde-escuro shadow-[0_4px_0_0_var(--verde)] transition-all active:translate-y-[3px] active:shadow-[0_1px_0_0_var(--verde)]"
        >
          Já sou vizinho, entrar
        </Link>
      </div>

      <p className="text-xs text-tinta-suave">
        Criar sua conta é grátis. Assinar é opcional — pra você a partir de R$ 19/mês,
        pro seu negócio a partir de R$ 49/mês.
      </p>
    </section>
  );
}
