import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

const categorias = ["Serviços da cidade", "Saúde", "Negócios locais", "Utilidades"];

export default function CatalogoPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Catálogo</h1>
        <p className="text-tinta-suave">Todos os mini-apps e serviços num lugar só.</p>
      </div>

      <div className="flex flex-col gap-3">
        {categorias.map((categoria) => (
          <Card key={categoria} className="flex items-center justify-between">
            <span className="font-titulo font-semibold text-tinta">{categoria}</span>
            <Selo variante="terracota">Em breve</Selo>
          </Card>
        ))}
      </div>
    </div>
  );
}
