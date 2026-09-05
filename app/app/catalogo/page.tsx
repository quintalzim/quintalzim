import Link from "next/link";
import BotaoFavoritar from "@/components/app/BotaoFavoritar";
import CardQuintalFinancas from "@/components/app/CardQuintalFinancas";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { nivelAtende, nivelPF } from "@/lib/assinaturas";
import { createClient } from "@/lib/supabase/server";

export default async function CatalogoPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const nivel = user ? await nivelPF(supabase, user.id) : "nenhum";
  const temBase = nivelAtende(nivel, "base");
  const temPremium = nivelAtende(nivel, "premium");

  const { data: minhaEmpresa } = user
    ? await supabase.from("empresas").select("id").eq("owner_id", user.id).maybeSingle()
    : { data: null };
  const temEmpresa = Boolean(minhaEmpresa);

  const { data: perfilFavoritos } = user
    ? await supabase.from("profiles").select("apps_favoritos").eq("id", user.id).maybeSingle()
    : { data: null };
  const favoritos: string[] = perfilFavoritos?.apps_favoritos ?? [];
  const ehFavorito = (id: string) => favoritos.includes(id);

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Catálogo</h1>
        <p className="text-tinta-suave">Todos os mini-apps e serviços num lugar só.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <CardQuintalFinancas
          bloqueado={!temBase}
          favorito={<BotaoFavoritar appId="financas" favoritoInicial={ehFavorito("financas")} />}
        />

        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-tinta">Calorias por Foto 📸</h2>
            <Selo variante={temPremium ? "verde" : "terracota"}>
              {temPremium ? "Ativo" : "Premium"}
            </Selo>
          </div>
          <p className="text-sm text-tinta-suave">
            Tira uma foto do prato e manda pro Prontim no WhatsApp — ele estima as calorias na
            hora.
          </p>
          {!temPremium && (
            <Link
              href="/app/para-voce"
              className="mt-1 font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
            >
              Assinar pra desbloquear →
            </Link>
          )}
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-tinta">Briefings do Dia ☀️</h2>
            <Selo variante="verde">Ativo</Selo>
          </div>
          <p className="text-sm text-tinta-suave">
            Todo dia de manhã, um resumo pronto: financeiro no Início
            {temEmpresa ? ", e da Empresa pra quem tem negócio." : "."}
          </p>
          <div className="mt-1 flex gap-4">
            <Link
              href="/app/inicio"
              className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
            >
              Ver no Início →
            </Link>
            {temEmpresa && (
              <Link
                href="/app/empresa"
                className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
              >
                Ver na Empresa →
              </Link>
            )}
          </div>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-tinta">Ferramentas 🧮</h2>
            <div className="flex items-center gap-2">
              <BotaoFavoritar appId="ferramentas" favoritoInicial={ehFavorito("ferramentas")} />
              <Selo variante="verde">Ativo</Selo>
            </div>
          </div>
          <p className="text-sm text-tinta-suave">
            Calculadora de juros, preço de serviço e gerador de recibos — rápido, sem precisar
            preencher nada aqui.
          </p>
          <Link
            href="/ferramentas"
            className="mt-1 font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            Abrir Ferramentas →
          </Link>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-tinta">Marketplace 🤝</h2>
            <div className="flex items-center gap-2">
              <BotaoFavoritar appId="marketplace" favoritoInicial={ehFavorito("marketplace")} />
              <Selo variante={temBase ? "verde" : "terracota"}>{temBase ? "Ativo" : "Base"}</Selo>
            </div>
          </div>
          <p className="text-sm text-tinta-suave">
            Personal trainers da região e o Balcão de Demandas — peça ajuda ou ofereça a sua.
          </p>
          <Link
            href={temBase ? "/marketplace" : "/app/para-voce"}
            className="mt-1 font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            {temBase ? "Abrir Marketplace →" : "Assinar pra desbloquear →"}
          </Link>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-tinta">Tarefas & Compras 📝</h2>
            <div className="flex items-center gap-2">
              <BotaoFavoritar appId="tarefas" favoritoInicial={ehFavorito("tarefas")} />
              <Selo variante={temBase ? "verde" : "terracota"}>{temBase ? "Ativo" : "Base"}</Selo>
            </div>
          </div>
          <p className="text-sm text-tinta-suave">
            Sem anotação solta no celular — digita ou fala e o Prontim organiza em tarefa ou
            compra pra você.
          </p>
          <Link
            href={temBase ? "/app/tarefas" : "/app/para-voce"}
            className="mt-1 font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            {temBase ? "Abrir Tarefas & Compras →" : "Assinar pra desbloquear →"}
          </Link>
        </Card>

        <Card className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-tinta">Chat com o Prontim 💬</h2>
            <div className="flex items-center gap-2">
              <BotaoFavoritar appId="prontim" favoritoInicial={ehFavorito("prontim")} />
              <Selo variante={temBase ? "verde" : "terracota"}>{temBase ? "Ativo" : "Base"}</Selo>
            </div>
          </div>
          <p className="text-sm text-tinta-suave">
            Converse com o Prontim direto no portal — sem depender do WhatsApp
            {temPremium ? "." : " (e, no Premium, também pelo WhatsApp)."}
          </p>
          <Link
            href={temBase ? "/app/prontim" : "/app/para-voce"}
            className="mt-1 font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            {temBase ? "Abrir Chat com o Prontim →" : "Assinar pra desbloquear →"}
          </Link>
        </Card>
      </div>
    </div>
  );
}
