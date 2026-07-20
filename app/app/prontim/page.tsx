import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

export default function ProntimPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Prontim</h1>
        <p className="text-tinta-suave">Seu concierge, sempre por perto.</p>
      </div>

      <Card className="flex flex-col items-center gap-3 text-center">
        <Selo variante="amarelo">Em breve</Selo>
        <h2 className="text-lg font-bold text-tinta">O chat com o Prontim já já chega</h2>
        <p className="text-sm text-tinta-suave">
          Pode perguntar qualquer coisa sobre o Quintalzim que ele te ajuda,
          do jeito simples do interior.
        </p>
      </Card>
    </div>
  );
}
