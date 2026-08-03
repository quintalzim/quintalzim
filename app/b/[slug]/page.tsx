import Link from "next/link";
import FormularioClienteFinal from "@/components/public/FormularioClienteFinal";
import { createClient } from "@/lib/supabase/server";

export default async function VitrinePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: empresa } = await supabase
    .from("empresas")
    .select("id, nome, slug")
    .eq("slug", slug)
    .maybeSingle();

  if (!empresa) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center bg-papel px-6 py-16 text-center">
        <p className="font-titulo text-2xl font-extrabold text-verde-escuro">Quintalzim</p>
        <p className="mt-3 text-tinta-suave">
          Não achamos esse negócio por aqui. Confere se o link está certinho.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="font-titulo text-sm font-semibold text-verde-escuro">
            Quintalzim
          </Link>
          <h1 className="font-titulo text-2xl font-extrabold text-tinta">{empresa.nome}</h1>
          <p className="text-tinta-suave">
            Deixa teu contato aqui que a gente te avisa e lembra dos teus horários — sem precisar
            de senha nem app novo.
          </p>
        </div>

        <FormularioClienteFinal empresaId={empresa.id} />
      </div>
    </div>
  );
}
