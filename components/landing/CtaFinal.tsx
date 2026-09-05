import Link from "next/link";

export default function CtaFinal() {
  return (
    <section className="bg-verde-escuro px-6 py-16 text-center text-papel">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5">
        <h2 className="font-titulo text-2xl font-extrabold sm:text-3xl">
          Bora resolver junto?
        </h2>
        <p className="text-papel/90">
          Cria sua conta agora — leva menos de um minuto e o Prontim já te
          recebe do outro lado.
        </p>
        <Link
          href="/entrar?aba=criar"
          className="inline-flex items-center justify-center rounded-lg bg-amarelo px-6 py-3 font-titulo text-base font-semibold text-[#4a3510] shadow-[0_4px_0_0_#c98f1f] transition-all active:translate-y-[3px] active:shadow-[0_1px_0_0_#c98f1f]"
        >
          Criar minha conta grátis
        </Link>
      </div>
    </section>
  );
}
