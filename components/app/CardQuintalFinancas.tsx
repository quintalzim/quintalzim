"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/client";

const URL_FINANCAS = "https://financas.quintalzim.com.br";

export default function CardQuintalFinancas() {
  const router = useRouter();
  const supabase = createClient();
  const [abrindo, setAbrindo] = useState(false);

  async function handleAbrir() {
    setAbrindo(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      router.push("/entrar");
      return;
    }

    const hash = `access_token=${session.access_token}&refresh_token=${session.refresh_token}`;
    window.open(`${URL_FINANCAS}/#${hash}`, "_blank", "noopener,noreferrer");
    setAbrindo(false);
  }

  return (
    <Card className="flex flex-col gap-2">
      <h2 className="text-lg font-bold text-tinta">Quintal de Finanças 🌱</h2>
      <p className="text-sm text-tinta-suave">Suas contas em ordem sem complicação</p>
      <Botao onClick={handleAbrir} disabled={abrindo} className="mt-2">
        {abrindo ? "Abrindo..." : "Abrir"}
      </Botao>
    </Card>
  );
}
