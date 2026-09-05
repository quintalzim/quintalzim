import PainelTarefasCompras from "@/components/app/PainelTarefasCompras";
import TelaBloqueada from "@/components/app/TelaBloqueada";
import { nivelAtende, nivelPF, nomeNivelPF } from "@/lib/assinaturas";
import { createClient } from "@/lib/supabase/server";

export default async function TarefasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nivel = user ? await nivelPF(supabase, user.id) : "nenhum";
  if (!nivelAtende(nivel, "base")) {
    return (
      <TelaBloqueada
        titulo="Tarefas & Compras"
        descricao="Organize tarefas e lista de compras direto no portal (e, no Premium, também pelo WhatsApp) assinando o plano PF."
        nomePlano={nomeNivelPF("base")}
      />
    );
  }

  const { data: itens } = user
    ? await supabase
        .from("itens_lista")
        .select("id, tipo, texto, quantidade, concluido, prazo, prioridade, origem")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
    : { data: [] };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Tarefas & Compras</h1>
        <p className="text-tinta-suave">Sem anotação solta — tudo aqui, prontinho.</p>
      </div>

      <PainelTarefasCompras itensIniciais={itens ?? []} />
    </div>
  );
}
