import Link from "next/link";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

// Card padrão mostrado no lugar de uma tela/recurso quando o usuário não tem
// o plano necessário. `nomePlano` é o nome de exibição do plano mínimo que
// falta pra liberar (ex: "PF Base", "Empresa Pro") — calculado pelo chamador
// via lib/assinaturas.ts (nomeNivelPF/nomeNivelEmpresa). `href` é pra onde o
// botão leva (default: página de planos PF); páginas de Empresa passam a
// própria URL da assinatura da Empresa.
export default function TelaBloqueada({
  titulo,
  descricao,
  nomePlano,
  href = "/app/para-voce",
  textoBotao = "Conhecer os planos",
}: {
  titulo: string;
  descricao: string;
  nomePlano: string;
  href?: string;
  textoBotao?: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-papel-2 text-2xl">
        🔒
      </div>
      <div className="flex flex-col items-center gap-2">
        <Selo variante="terracota">Recurso do plano {nomePlano}</Selo>
        <h1 className="font-titulo text-xl font-extrabold text-tinta">{titulo}</h1>
      </div>
      <Card className="flex flex-col gap-3">
        <p className="text-sm text-tinta-suave">{descricao}</p>
        <Link href={href}>
          <Botao type="button" className="w-full">
            {textoBotao}
          </Botao>
        </Link>
      </Card>
    </div>
  );
}
