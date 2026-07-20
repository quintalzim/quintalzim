import { redirect } from "next/navigation";
import HeaderApp from "@/components/app/HeaderApp";
import NavInferior from "@/components/app/NavInferior";
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

  return (
    <div className="flex min-h-screen flex-col bg-papel">
      <HeaderApp email={user.email ?? ""} />
      <main className="flex-1 px-5 py-6 pb-24">{children}</main>
      <NavInferior />
    </div>
  );
}
