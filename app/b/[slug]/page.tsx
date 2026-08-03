import Link from "next/link";
import FormularioClienteFinal from "@/components/public/FormularioClienteFinal";
import FormularioSolicitarAgendamento from "@/components/public/FormularioSolicitarAgendamento";
import Card from "@/components/ui/Card";
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
    .select(
      "id, nome, slug, owner_id, descricao, endereco, telefone_contato, instagram, horario_funcionamento"
    )
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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const detalhes = [
    empresa.endereco ? { rotulo: "Endereço", valor: empresa.endereco } : null,
    empresa.horario_funcionamento
      ? { rotulo: "Horário", valor: empresa.horario_funcionamento }
      : null,
    empresa.telefone_contato ? { rotulo: "Contato", valor: empresa.telefone_contato } : null,
    empresa.instagram ? { rotulo: "Instagram", valor: empresa.instagram } : null,
  ].filter(Boolean) as { rotulo: string; valor: string }[];

  return (
    <div className="flex flex-1 flex-col items-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="font-titulo text-sm font-semibold text-verde-escuro">
            Quintalzim
          </Link>
          <h1 className="font-titulo text-2xl font-extrabold text-tinta">{empresa.nome}</h1>
          {empresa.descricao && <p className="text-tinta-suave">{empresa.descricao}</p>}
        </div>

        {detalhes.length > 0 && (
          <Card className="flex flex-col gap-2">
            {detalhes.map((item) => (
              <div key={item.rotulo}>
                <p className="text-xs font-semibold text-tinta-suave">{item.rotulo}</p>
                <p className="text-sm text-tinta">{item.valor}</p>
              </div>
            ))}
          </Card>
        )}

        <Card className="flex flex-col gap-3">
          {user ? (
            <>
              <p className="text-sm text-tinta-suave">
                Pede teu horário por aqui — a gente avisa {empresa.nome} na hora.
              </p>
              <FormularioSolicitarAgendamento
                empresaId={empresa.id}
                empresaNome={empresa.nome}
                ownerId={empresa.owner_id}
              />
            </>
          ) : (
            <>
              <p className="text-sm text-tinta-suave">
                Deixa teu contato aqui que a gente te avisa e lembra dos teus horários — sem
                precisar de senha nem app novo.
              </p>
              <FormularioClienteFinal empresaId={empresa.id} />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
