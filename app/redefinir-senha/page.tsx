import Link from "next/link";
import { redirect } from "next/navigation";
import FormularioNovaSenha from "@/components/auth/FormularioNovaSenha";
import { createClient } from "@/lib/supabase/server";

export default async function RedefinirSenhaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar?erro=link-invalido");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-sm flex-col gap-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <Link href="/" className="font-titulo text-2xl font-extrabold text-verde-escuro">
            Quintalzim
          </Link>
          <p className="text-tinta-suave">Escolhe uma senha nova pro teu portão.</p>
        </div>

        <FormularioNovaSenha />
      </div>
    </div>
  );
}
