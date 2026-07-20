export default function Hero() {
  return (
    <section className="flex flex-col items-center gap-5 px-6 pb-14 pt-4 text-center">
      <span className="inline-flex items-center rounded-full border-2 border-dashed border-verde bg-verde/5 px-4 py-1.5 text-sm font-semibold text-verde-escuro">
        🌱 tá brotando · pode chegar mais perto
      </span>

      <h1 className="max-w-md text-4xl font-extrabold leading-tight text-tinta sm:text-5xl">
        Vem aí o seu <span className="text-terracota">Quintalzim</span>
      </h1>

      <p className="max-w-sm text-base text-tinta-suave sm:text-lg">
        Um lugar só, no seu WhatsApp, pra resolver as coisas da vida e do seu
        negócio. Sem baixar dez aplicativos. Sem tecniquês. Sem frescura.
      </p>
    </section>
  );
}
