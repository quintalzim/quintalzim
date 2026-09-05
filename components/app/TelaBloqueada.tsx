import Link from "next/link";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import type { NivelPF } from "@/lib/assinaturas";

const NOME_NIVEL: Record<NivelPF, string> = {
  nenhum: "PF Base",
  base: "PF Premium",
  premium: "PF Premium",
};

// Card padrão mostrado no lugar de uma tela/recurso quando o usuário não tem
// o plano necessário. `minimo` é o nível que falta pra liberar (usado só pra
// escolher o nome do plano na mensagem).
export default function TelaBloqueada({
  titulo,
  descricao,
  minimo,
}: {
  titulo: string;
  descricao: string;
  minimo: NivelPF;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 py-6 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-papel-2 text-2xl">
        🔒
      </div>
      <div className="flex flex-col items-center gap-2">
        <Selo variante="terracota">Recurso do plano {NOME_NIVEL[minimo]}</Selo>
        <h1 className="font-titulo text-xl font-extrabold text-tinta">{titulo}</h1>
      </div>
      <Card className="flex flex-col gap-3">
        <p className="text-sm text-tinta-suave">{descricao}</p>
        <Link href="/app/para-voce">
          <Botao type="button" className="w-full">
            Conhecer os planos
          </Botao>
        </Link>
      </Card>
    </div>
  );
}
