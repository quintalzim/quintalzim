"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Campo from "@/components/ui/Campo";
import Card from "@/components/ui/Card";

function paraNumero(v: string): number {
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatarReais(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default function PrecoDeServicoPage() {
  const [material, setMaterial] = useState("0");
  const [horas, setHoras] = useState("2");
  const [valorHora, setValorHora] = useState("30");
  const [margem, setMargem] = useState("30");

  const resultado = useMemo(() => {
    const custoMaterial = paraNumero(material);
    const custoMaoDeObra = paraNumero(horas) * paraNumero(valorHora);
    const custoTotal = custoMaterial + custoMaoDeObra;
    const m = Math.min(95, Math.max(0, paraNumero(margem))) / 100;

    if (custoTotal <= 0) return null;

    // Margem sobre o preço de venda (não markup sobre o custo) — evita o erro
    // clássico de achar que "custo + 30%" já garante 30% de lucro sobre a venda.
    const precoSugerido = custoTotal / (1 - m);
    const lucro = precoSugerido - custoTotal;

    return { custoMaterial, custoMaoDeObra, custoTotal, precoSugerido, lucro };
  }, [material, horas, valorHora, margem]);

  return (
    <div className="flex flex-1 justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div>
          <Link href="/ferramentas" className="font-titulo text-sm font-semibold text-verde-escuro">
            ← Ferramentas
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-tinta">Preço de serviço</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            Soma o que você gasta e a margem que quer ganhar — a calculadora sugere quanto cobrar.
          </p>
        </div>

        <Card className="flex flex-col gap-4">
          <Campo
            rotulo="Custo de material/insumos (R$)"
            inputMode="decimal"
            value={material}
            onChange={(e) => setMaterial(e.target.value)}
          />
          <Campo
            rotulo="Horas de trabalho"
            inputMode="decimal"
            value={horas}
            onChange={(e) => setHoras(e.target.value)}
          />
          <Campo
            rotulo="Valor da sua hora (R$)"
            inputMode="decimal"
            value={valorHora}
            onChange={(e) => setValorHora(e.target.value)}
          />
          <Campo
            rotulo="Margem de lucro desejada (%)"
            inputMode="decimal"
            value={margem}
            onChange={(e) => setMargem(e.target.value)}
          />
        </Card>

        {resultado && (
          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-tinta-suave">Custo total (material + mão de obra)</span>
              <span className="font-semibold text-tinta">{formatarReais(resultado.custoTotal)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-tinta-suave">Lucro estimado</span>
              <span className="font-semibold text-verde-escuro">{formatarReais(resultado.lucro)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-papel-2 pt-2 text-sm">
              <span className="font-semibold text-tinta">Preço sugerido</span>
              <span className="font-bold text-tinta">{formatarReais(resultado.precoSugerido)}</span>
            </div>
            <p className="text-xs text-tinta-suave">
              Não inclui despesas fixas do negócio (aluguel, contas) ratedas por serviço — se você
              já sabe esse valor por atendimento, soma ele no campo de material/insumos.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
