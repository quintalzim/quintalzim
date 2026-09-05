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

export default function JurosEDividasPage() {
  const [valor, setValor] = useState("1000");
  const [taxa, setTaxa] = useState("5");
  const [meses, setMeses] = useState("12");

  const resultado = useMemo(() => {
    const p = paraNumero(valor);
    const i = paraNumero(taxa) / 100;
    const n = Math.max(1, Math.round(paraNumero(meses)));

    if (p <= 0 || i < 0 || n <= 0) return null;

    // Tabela Price: parcela fixa que quita o valor com juros compostos em n meses.
    const parcela = i === 0 ? p / n : (p * i) / (1 - Math.pow(1 + i, -n));
    const totalPago = parcela * n;
    const totalJuros = totalPago - p;

    return { parcela, totalPago, totalJuros, n };
  }, [valor, taxa, meses]);

  return (
    <div className="flex flex-1 justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div>
          <Link href="/ferramentas" className="font-titulo text-sm font-semibold text-verde-escuro">
            ← Ferramentas
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-tinta">Juros e dívidas</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            Descubra o valor da parcela e quanto de juros você vai pagar no total, antes de fechar
            um parcelamento ou dívida.
          </p>
        </div>

        <Card className="flex flex-col gap-4">
          <Campo
            rotulo="Valor da dívida (R$)"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
          />
          <Campo
            rotulo="Taxa de juros ao mês (%)"
            inputMode="decimal"
            value={taxa}
            onChange={(e) => setTaxa(e.target.value)}
          />
          <Campo
            rotulo="Número de parcelas (meses)"
            inputMode="numeric"
            value={meses}
            onChange={(e) => setMeses(e.target.value)}
          />
        </Card>

        {resultado && (
          <Card className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-tinta-suave">Parcela mensal estimada</span>
              <span className="font-semibold text-tinta">{formatarReais(resultado.parcela)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-tinta-suave">Total pago em {resultado.n}x</span>
              <span className="font-semibold text-tinta">{formatarReais(resultado.totalPago)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-papel-2 pt-2 text-sm">
              <span className="font-semibold text-tinta">Total de juros</span>
              <span className="font-bold text-terracota-escuro">
                {formatarReais(resultado.totalJuros)}
              </span>
            </div>
            <p className="text-xs text-tinta-suave">
              Cálculo pela Tabela Price (parcelas fixas), o mesmo modelo usado na maioria dos
              parcelamentos e financiamentos. É uma estimativa — confira sempre as condições reais
              no contrato.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
