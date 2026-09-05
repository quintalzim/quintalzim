import Link from "next/link";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";

const ferramentas = [
  {
    href: "/ferramentas/juros-e-dividas",
    titulo: "Calculadora de juros e dívidas",
    descricao: "Descubra quanto vai pagar de juros num parcelamento ou dívida antes de fechar.",
    ativo: true,
  },
  {
    href: "/ferramentas/preco-de-servico",
    titulo: "Calculadora de preço de serviço",
    descricao: "Some seus custos e a margem que você quer ganhar — a calculadora sugere o preço.",
    ativo: true,
  },
  {
    href: "/ferramentas/recibo",
    titulo: "Gerador de recibos",
    descricao: "Preenche os dados e já sai um recibo pronto pra imprimir ou salvar em PDF.",
    ativo: true,
  },
  {
    href: "/ferramentas/bio",
    titulo: "Gerador de bio e legenda",
    descricao: "Conta o que seu negócio faz e a IA escreve uma bio ou legenda pronta pra usar.",
    ativo: true,
  },
  {
    href: "/ferramentas/extrato",
    titulo: "Conversor de extrato para Excel",
    descricao: "Manda uma foto ou print do extrato do banco e recebe uma planilha organizada.",
    ativo: true,
  },
];

export default function FerramentasPage() {
  return (
    <div className="flex flex-1 justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div>
          <Link href="/" className="font-titulo text-sm font-semibold text-verde-escuro">
            Quintalzim
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-tinta">Ferramentas</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            Utilitários rápidos e gratuitos pra quem tem um negócio pequeno — sem precisar de conta.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {ferramentas.map((f) =>
            f.ativo ? (
              <Link key={f.href} href={f.href}>
                <Card className="flex h-full flex-col gap-2 transition-transform hover:-translate-y-0.5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-tinta">{f.titulo}</h2>
                    <Selo variante="verde">Ativo</Selo>
                  </div>
                  <p className="text-sm text-tinta-suave">{f.descricao}</p>
                </Card>
              </Link>
            ) : (
              <Card key={f.href} className="flex flex-col gap-2 opacity-70">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-tinta">{f.titulo}</h2>
                  <Selo variante="terracota">Em breve</Selo>
                </div>
                <p className="text-sm text-tinta-suave">{f.descricao}</p>
              </Card>
            )
          )}
        </div>
      </div>
    </div>
  );
}
