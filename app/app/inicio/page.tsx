import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

export default function InicioPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Início</h1>
        <p className="text-tinta-suave">Seus destaques por aqui, prontinho.</p>
      </div>

      <Card className="flex flex-col gap-2">
        <Selo variante="amarelo">Em breve</Selo>
        <h2 className="text-lg font-bold text-tinta">Resumo do dia</h2>
        <p className="text-sm text-tinta-suave">
          Aqui vão aparecer avisos, novidades e sugestões do Prontim para você.
        </p>
      </Card>

      <Card className="flex flex-col gap-2">
        <Selo variante="verde">Em breve</Selo>
        <h2 className="text-lg font-bold text-tinta">Seus mini-apps favoritos</h2>
        <p className="text-sm text-tinta-suave">
          Acesso rápido para o que você mais usa no Quintalzim.
        </p>
      </Card>
    </div>
  );
}
