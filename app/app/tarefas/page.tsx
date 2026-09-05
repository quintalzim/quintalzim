import PainelTarefasCompras from "@/components/app/PainelTarefasCompras";
import { createClient } from "@/lib/supabase/server";

export default async function TarefasPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
