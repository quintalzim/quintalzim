"use client";

import Link from "next/link";
import { useState } from "react";
import Botao from "@/components/ui/Botao";
import Campo from "@/components/ui/Campo";
import Card from "@/components/ui/Card";

function paraNumero(v: string): number {
  const n = Number(v.replace(/\./g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
}

function formatarReais(v: number): string {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function porExtenso(v: number): string {
  // Simplificado: mostra em reais e centavos por extenso não é essencial pro
  // v1 (recibo informal) — mantemos só o valor numérico formatado.
  return formatarReais(v);
}

export default function ReciboPage() {
  const [recebi, setRecebi] = useState("");
  const [de, setDe] = useState("");
  const [valor, setValor] = useState("");
  const [referente, setReferente] = useState("");
  const [cidade, setCidade] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));

  const valorNum = paraNumero(valor);
  const dataFormatada = data
    ? new Date(data + "T12:00:00").toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <div className="flex flex-1 flex-col items-center gap-8 bg-papel px-6 py-16 print:bg-white print:py-0 lg:flex-row lg:items-start lg:justify-center">
      <div className="flex w-full max-w-md flex-col gap-6 print:hidden">
        <div>
          <Link href="/ferramentas" className="font-titulo text-sm font-semibold text-verde-escuro">
            ← Ferramentas
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-tinta">Gerador de recibos</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            Preenche os dados abaixo — o recibo é montado ao lado (ou embaixo, no celular) e já sai
            pronto pra imprimir ou salvar em PDF.
          </p>
        </div>

        <Card className="flex flex-col gap-4">
          <Campo
            rotulo="Recebi de (quem pagou)"
            value={de}
            onChange={(e) => setDe(e.target.value)}
            placeholder="Nome do cliente"
          />
          <Campo
            rotulo="Valor (R$)"
            inputMode="decimal"
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            placeholder="150,00"
          />
          <Campo
            rotulo="Referente a"
            value={referente}
            onChange={(e) => setReferente(e.target.value)}
            placeholder="Corte de cabelo, conserto, etc."
          />
          <Campo
            rotulo="Emitido por (seu nome/negócio)"
            value={recebi}
            onChange={(e) => setRecebi(e.target.value)}
          />
          <Campo
            rotulo="Cidade"
            value={cidade}
            onChange={(e) => setCidade(e.target.value)}
          />
          <Campo
            rotulo="Data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
          />
        </Card>

        <Botao type="button" onClick={() => window.print()}>
          Imprimir / salvar como PDF
        </Botao>
      </div>

      {/* Prévia do recibo — sempre visível na tela (form some ao imprimir, essa fica). */}
      <div className="flex w-full max-w-lg flex-col gap-6 print:max-w-full">
        <div className="flex flex-col gap-6 rounded-xl border-2 border-tinta/20 bg-white p-8 print:border-0 print:p-0">
          <div className="text-center">
            <h2 className="font-titulo text-xl font-bold text-tinta">RECIBO</h2>
            <p className="text-sm text-tinta-suave">{valorNum > 0 ? formatarReais(valorNum) : "R$ 0,00"}</p>
          </div>
          <p className="text-sm leading-relaxed text-tinta">
            Recebi de <span className="font-semibold">{de || "___________________"}</span> a
            quantia de <span className="font-semibold">{valorNum > 0 ? porExtenso(valorNum) : "___________________"}</span>,
            referente a <span className="font-semibold">{referente || "___________________"}</span>.
          </p>
          <p className="text-sm text-tinta-suave">
            {(cidade || "___________________")}, {dataFormatada || "___/___/______"}.
          </p>
          <div className="mt-8 flex flex-col items-center gap-1">
            <div className="w-56 border-t border-tinta pt-1 text-center text-sm text-tinta">
              {recebi || "Assinatura"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
