function formatarDataHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function BriefingEmpresa({
  mensagem,
  criadoEm,
}: {
  mensagem: string | null;
  criadoEm: string | null;
}) {
  if (!mensagem) {
    return (
      <p className="text-sm text-tinta-suave">
        Todo dia às 7h15 o Prontim monta aqui um resumo com a agenda de hoje, o que foi confirmado
        ontem e um lembrete do post do dia.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {criadoEm && <p className="text-xs text-tinta-suave">{formatarDataHora(criadoEm)}</p>}
      <p className="whitespace-pre-wrap text-sm text-tinta">{mensagem}</p>
    </div>
  );
}
