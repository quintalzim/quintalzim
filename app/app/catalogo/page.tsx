import CardQuintalFinancas from "@/components/app/CardQuintalFinancas";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

const emBreve = [
  { titulo: "Calorias por Foto 📸", descricao: "Tira uma foto do prato e pronto." },
  { titulo: "Briefings do Dia ☀️", descricao: "Um resumo rapidinho pra começar o dia." },
  { titulo: "Prontim no WhatsApp 💬", descricao: "Seu Prontim direto no zap." },
];

export default function CatalogoPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Catálogo</h1>
        <p className="text-tinta-suave">Todos os mini-apps e serviços num lugar só.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CardQuintalFinancas />

        {emBreve.map((item) => (
          <Card key={item.titulo} className="flex flex-col gap-2 opacity-70">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-tinta">{item.titulo}</h2>
              <Selo variante="terracota">Em breve</Selo>
            </div>
            <p className="text-sm text-tinta-suave">{item.descricao}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
