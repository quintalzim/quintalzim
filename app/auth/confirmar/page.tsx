import Link from "next/link";
import { redirect } from "next/navigation";
import Botao from "@/components/ui/Botao";
import { confirmarAcesso } from "./actions";

export default async function ConfirmarPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash: tokenHash, type } = await searchParams;

  if (!tokenHash || !type) {
    redirect("/entrar?erro=link-invalido");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-8 text-center">
        <div className="flex flex-col items-center gap-2">
          <Link href="/" className="font-titulo text-2xl font-extrabold text-verde-escuro">
            Quintalzim
          </Link>
          <p className="text-tinta-suave">
            Achamos teu link. Clica no botão pra confirmar e a gente abre o portão.
          </p>
        </div>

        <form action={confirmarAcesso} className="flex w-full flex-col gap-4">
          <input type="hidden" name="token_hash" value={tokenHash} />
          <input type="hidden" name="type" value={type} />
          <Botao type="submit" className="w-full">
            Continuar 🌱
          </Botao>
        </form>
      </div>
    </div>
  );
}
