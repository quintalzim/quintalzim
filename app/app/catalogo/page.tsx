import Link from "next/link";
import CardQuintalFinancas from "@/components/app/CardQuintalFinancas";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

const emBreve = [{ titulo: "Prontim no WhatsApp 💬", descricao: "Seu Prontim direto no zap." }];

export default function CatalogoPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Catálogo</h1>
        <p className="text-tinta-suave">Todos os mini-apps e serviços num lugar só.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CardQuintalFinancas />

        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-tinta">Calorias por Foto 📸</h2>
            <Selo variante="verde">Ativo</Selo>
          </div>
          <p className="text-sm text-tinta-suave">
            Tira uma foto do prato e manda pro Prontim no WhatsApp — ele estima as calorias na
            hora.
          </p>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-tinta">Briefings do Dia ☀️</h2>
            <Selo variante="verde">Ativo</Selo>
          </div>
          <p className="text-sm text-tinta-suave">
            Todo dia de manhã, um resumo pronto: financeiro no Início, e da Empresa pra quem tem
            negócio.
          </p>
          <div className="mt-1 flex gap-4">
            <Link
              href="/app/inicio"
              className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
            >
              Ver no Início →
            </Link>
            <Link
              href="/app/empresa"
              className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
            >
              Ver na Empresa →
            </Link>
          </div>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-tinta">Ferramentas 🧮</h2>
            <Selo variante="verde">Ativo</Selo>
          </div>
          <p className="text-sm text-tinta-suave">
            Calculadora de juros, preço de serviço e gerador de recibos — rápido, sem precisar
            preencher nada aqui.
          </p>
          <Link
            href="/ferramentas"
            className="mt-1 font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            Abrir Ferramentas →
          </Link>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-tinta">Marketplace 🤝</h2>
            <Selo variante="verde">Ativo</Selo>
          </div>
          <p className="text-sm text-tinta-suave">
            Personal trainers da região e o Balcão de Demandas — peça ajuda ou ofereça a sua.
          </p>
          <Link
            href="/marketplace"
            className="mt-1 font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            Abrir Marketplace →
          </Link>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-tinta">Tarefas & Compras 📝</h2>
            <Selo variante="verde">Ativo</Selo>
          </div>
          <p className="text-sm text-tinta-suave">
            Sem anotação solta no celular — digita ou fala e o Prontim organiza em tarefa ou
            compra pra você.
          </p>
          <Link
            href="/app/tarefas"
            className="mt-1 font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            Abrir Tarefas & Compras →
          </Link>
        </Card>

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
