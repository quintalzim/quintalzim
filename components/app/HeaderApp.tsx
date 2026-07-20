"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function HeaderApp({ nome }: { nome: string }) {
  const router = useRouter();
  const supabase = createClient();

  async function handleSair() {
    await supabase.auth.signOut();
    router.push("/entrar");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between border-b border-papel-2 bg-papel/95 px-5 py-4 backdrop-blur">
      <Link href="/app/inicio" className="font-titulo text-xl font-extrabold text-verde-escuro">
        Quintalzim
      </Link>
      <div className="flex items-center gap-3">
        <span className="hidden text-sm font-semibold text-tinta sm:inline">Oi, {nome} 🌱</span>
        <button
          onClick={handleSair}
          className="text-sm font-semibold text-terracota-escuro hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-verde rounded"
        >
          Sair
        </button>
      </div>
    </header>
  );
}
