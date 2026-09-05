import Link from "next/link";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

// Card de upsell curto pra usar NO LUGAR de um painel/seção da própria
// página da Empresa (diferente do TelaBloqueada, que ocupa a página inteira
// — aqui a página continua com outras seções liberadas ao redor). Link vai
// pra âncora da própria "Assinatura da Empresa", já presente em /app/empresa,
// em vez de uma página separada de planos.
export default function PainelBloqueadoEmpresa({
  titulo,
  descricao,
  nomePlano,
}: {
  titulo: string;
  descricao: string;
  nomePlano: string;
}) {
  return (
    <Card className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-tinta">{titulo}</h2>
        <Selo variante="terracota">{nomePlano}</Selo>
      </div>
      <p className="text-sm text-tinta-suave">{descricao}</p>
      <Link
        href="/app/empresa#assinatura-empresa"
        className="mt-1 font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
      >
        Assinar pra desbloquear →
      </Link>
    </Card>
  );
}
