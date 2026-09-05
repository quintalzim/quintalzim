import Link from "next/link";

const linksNav = [
  { href: "/para-voce", rotulo: "Pra você" },
  { href: "/para-seu-negocio", rotulo: "Pro seu negócio" },
  { href: "/ferramentas", rotulo: "Ferramentas grátis" },
];

export default function LandingHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-papel-2 bg-papel/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-4">
        <Link href="/" className="font-titulo text-2xl font-extrabold text-terracota">
          quintalzim
        </Link>

        <nav className="hidden items-center gap-6 sm:flex">
          {linksNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-semibold text-tinta-suave transition-colors hover:text-verde-escuro"
            >
              {link.rotulo}
            </Link>
          ))}
        </nav>

        <Link
          href="/entrar"
          className="inline-flex items-center justify-center rounded-lg border-2 border-verde px-4 py-2 font-titulo text-sm font-semibold text-verde-escuro shadow-[0_3px_0_0_var(--verde)] transition-all active:translate-y-[2px] active:shadow-[0_1px_0_0_var(--verde)]"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
