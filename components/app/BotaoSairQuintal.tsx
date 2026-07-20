"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Botao from "@/components/ui/Botao";
import { createClient } from "@/lib/supabase/client";

export default function BotaoSairQuintal() {
  const router = useRouter();
  const supabase = createClient();
  const [saindo, setSaindo] = useState(false);

  async function handleSair() {
    setSaindo(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <Botao variante="secundario" onClick={handleSair} disabled={saindo}>
      {saindo ? "Saindo..." : "Sair do quintal"}
    </Botao>
  );
}
