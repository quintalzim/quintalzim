import ListaEsperaForm from "@/components/ListaEsperaForm";

export default function CapturaEmail() {
  return (
    <section className="px-6 py-12">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 text-center">
        <h2 className="font-titulo text-2xl font-extrabold text-tinta">
          O portão abre primeiro pra quem tá na lista. 👇
        </h2>
        <ListaEsperaForm />
      </div>
    </section>
  );
}
