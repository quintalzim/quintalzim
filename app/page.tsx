import ListaEsperaForm from "@/components/ListaEsperaForm";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-papel px-6 py-16">
      <main className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <span className="font-titulo text-4xl font-extrabold text-verde-escuro">
          Quintalzim
        </span>

        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-extrabold leading-tight text-tinta">
            Vem aí o seu Quintalzim
          </h1>
          <p className="text-base text-tinta-suave">
            O portal que junta os serviços da sua cidade num lugar só, com a
            ajuda do Prontim. Deixa seu e-mail que a gente te avisa assim que
            abrir.
          </p>
        </div>

        <ListaEsperaForm />
      </main>
    </div>
  );
}
