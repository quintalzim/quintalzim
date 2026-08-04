import { redirect } from "next/navigation";
import HeaderApp from "@/components/app/HeaderApp";
import NavInferior from "@/components/app/NavInferior";
import PortalRestritoClienteFinal from "@/components/app/PortalRestritoClienteFinal";
import { createClient } from "@/lib/supabase/server";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/entrar");
  }

  const nomeCompleto = (user.user_metadata?.name as string | undefined)?.trim();
  const primeiroNome = nomeCompleto?.split(" ")[0] || user.email?.split("@")[0] || "por aqui";

  const { data: perfil } = await supabase
    .from("profiles")
    .select("acesso_portal")
    .eq("id", user.id)
    .maybeSingle();

  const restrito = perfil?.acesso_portal === "restrito";

  if (restrito) {
    return (
      <div className="flex min-h-screen flex-col bg-papel">
        <HeaderApp nome={primeiroNome} />
        <main className="flex-1 px-5 py-6 pb-24">
          <PortalRestritoClienteFinal />
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-papel">
      <HeaderApp nome={primeiroNome} />
      <main className="flex-1 px-5 py-6 pb-24">{children}</main>
      <NavInferior />
    </div>
  );
}
