"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";

type Transacao = { data: string; descricao: string; valor: number; tipo: string };

function lerComoBase64(arquivo: File): Promise<{ base64: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();
    leitor.onload = () => {
      const resultado = leitor.result as string;
      const [prefixo, base64] = resultado.split(",");
      const mediaType = prefixo.match(/data:(.*);base64/)?.[1] || arquivo.type || "image/jpeg";
      resolve({ base64, mediaType });
    };
    leitor.onerror = reject;
    leitor.readAsDataURL(arquivo);
  });
}

export default function ConversorDeExtratoPage() {
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [transacoes, setTransacoes] = useState<Transacao[] | null>(null);

  function handleArquivo(event: ChangeEvent<HTMLInputElement>) {
    const arquivoSelecionado = event.target.files?.[0] || null;
    setArquivo(arquivoSelecionado);
    setTransacoes(null);
    setErro("");
    if (arquivoSelecionado) {
      setPreview(URL.createObjectURL(arquivoSelecionado));
    } else {
      setPreview(null);
    }
  }

  async function processar() {
    if (!arquivo) return;
    setErro("");
    setTransacoes(null);
    setCarregando(true);
    try {
      const { base64, mediaType } = await lerComoBase64(arquivo);
      const resposta = await fetch("/api/ferramentas/extrato", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imagemBase64: base64, mediaType }),
      });
      const dados = await resposta.json();
      if (!resposta.ok) {
        setErro(dados.erro || "Não consegui ler o extrato agora.");
        return;
      }
      setTransacoes(dados.transacoes);
    } catch {
      setErro("Não consegui ler o extrato agora. Confere sua internet e tenta de novo.");
    } finally {
      setCarregando(false);
    }
  }

  async function baixarPlanilha() {
    if (!transacoes || transacoes.length === 0) return;
    const XLSX = await import("xlsx");
    const linhas = transacoes.map((t) => ({
      Data: t.data,
      Descrição: t.descricao,
      Valor: t.valor,
      Tipo: t.tipo === "receita" ? "Receita" : "Despesa",
    }));
    const planilha = XLSX.utils.json_to_sheet(linhas);
    planilha["!cols"] = [{ wch: 12 }, { wch: 40 }, { wch: 12 }, { wch: 12 }];
    const livro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(livro, planilha, "Extrato");
    XLSX.writeFile(livro, "extrato-quintalzim.xlsx");
  }

  const total = transacoes?.reduce(
    (soma, t) => soma + (t.tipo === "receita" ? t.valor : -t.valor),
    0
  );

  return (
    <div className="flex flex-1 justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-md flex-col gap-6">
        <div>
          <Link href="/ferramentas" className="font-titulo text-sm font-semibold text-verde-escuro">
            ← Ferramentas
          </Link>
          <h1 className="mt-2 text-2xl font-extrabold text-tinta">Extrato para Excel</h1>
          <p className="mt-1 text-sm text-tinta-suave">
            Manda uma foto ou print do teu extrato bancário ou fatura — a IA lê as transações e
            monta uma planilha pra baixar.
          </p>
        </div>

        <Card className="flex flex-col gap-4">
          <input
            type="file"
            accept="image/*"
            onChange={handleArquivo}
            className="text-sm text-tinta file:mr-3 file:rounded-md file:border-0 file:bg-verde file:px-3 file:py-2 file:text-sm file:font-semibold file:text-papel"
          />
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="Prévia do extrato" className="max-h-48 rounded-lg border border-papel-2 object-contain" />
          )}
          {erro && <p className="text-sm text-terracota-escuro">{erro}</p>}
          <Botao type="button" disabled={!arquivo || carregando} onClick={processar}>
            {carregando ? "Lendo o extrato..." : "Ler extrato"}
          </Botao>
        </Card>

        {transacoes && transacoes.length > 0 && (
          <Card className="flex flex-col gap-3">
            <p className="font-titulo text-sm font-bold text-tinta">
              {transacoes.length} transação(ões) encontrada(s)
            </p>
            <div className="flex max-h-64 flex-col gap-1.5 overflow-y-auto">
              {transacoes.map((t, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="truncate text-tinta">{t.descricao}</p>
                    <p className="text-xs text-tinta-suave">{t.data}</p>
                  </div>
                  <span
                    className={`ml-2 shrink-0 font-semibold ${
                      t.tipo === "receita" ? "text-verde-escuro" : "text-terracota-escuro"
                    }`}
                  >
                    {t.tipo === "receita" ? "+" : "-"}
                    {t.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                  </span>
                </div>
              ))}
            </div>
            {typeof total === "number" && (
              <div className="flex items-center justify-between border-t border-papel-2 pt-2 text-sm">
                <span className="font-semibold text-tinta">Saldo do período</span>
                <span className="font-bold text-tinta">
                  {total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                </span>
              </div>
            )}
            <Botao type="button" onClick={baixarPlanilha}>
              Baixar planilha (.xlsx)
            </Botao>
            <p className="text-xs text-tinta-suave">
              Confere os valores antes de usar — a leitura é feita por IA e pode errar em fotos
              tremidas ou com pouca luz.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
