import PainelChatProntim from "@/components/app/PainelChatProntim";
import TelaBloqueada from "@/components/app/TelaBloqueada";
import { nivelAtende, nivelPF } from "@/lib/assinaturas";
import { createClient } from "@/lib/supabase/server";

export default async function ProntimPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nivel = user ? await nivelPF(supabase, user.id) : "nenhum";
  if (!nivelAtende(nivel, "base")) {
    return (
      <TelaBloqueada
        titulo="Chat com o Prontim"
        descricao="Converse com o Prontim direto no portal assinando o plano PF."
        minimo="base"
      />
    );
  }

  const { data: historico } = user
    ? await supabase
        .from("mensagens_prontim_web")
        .select("id, autor, texto")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50)
    : { data: [] };

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Prontim</h1>
        <p className="text-tinta-suave">Seu concierge, sempre por perto.</p>
      </div>

      <PainelChatProntim historicoInicial={historico ?? []} />
    </div>
  );
}
