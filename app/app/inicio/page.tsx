import Link from "next/link";
import { APPS_CATALOGO } from "@/lib/apps-catalogo";
import Varal from "@/components/landing/Varal";
import Botao from "@/components/ui/Botao";
import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { nivelAtende, nivelPF } from "@/lib/assinaturas";
import { clienteAdmin } from "@/lib/push-servidor";
import { buscarPlanoHabitos } from "@/lib/quiz/plano-habitos";
import { createClient } from "@/lib/supabase/server";

function formatarDataHora(iso: string): string {
  try {
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default async function InicioPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: briefing } = user
    ? await supabase
        .from("briefings_financeiros")
        .select("mensagem, created_at")
        .eq("profile_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };

  const admin = user ? clienteAdmin() : null;
  const planoHabitos = admin && user ? await buscarPlanoHabitos(admin, user.id, user.email) : null;

  const { data: itensAbertos } = user
    ? await supabase
        .from("itens_lista")
        .select("id, tipo, texto, quantidade, prazo")
        .eq("profile_id", user.id)
        .eq("concluido", false)
        .order("created_at", { ascending: false })
    : { data: [] };

  const tarefasAbertas = (itensAbertos ?? []).filter((i) => i.tipo === "tarefa");
  const comprasAbertas = (itensAbertos ?? []).filter((i) => i.tipo === "compra");

  const nivel = user ? await nivelPF(supabase, user.id) : "nenhum";

  const { data: perfilFavoritos } = user
    ? await supabase.from("profiles").select("apps_favoritos").eq("id", user.id).maybeSingle()
    : { data: null };
  const idsFavoritos: string[] = perfilFavoritos?.apps_favoritos ?? [];
  const appsFavoritos = APPS_CATALOGO.filter((app) => idsFavoritos.includes(app.id));

  if (nivel === "nenhum") {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-6">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-tinta">Início</h1>
          <p className="text-tinta-suave">Ainda falta pouco pra tudo isso ser seu.</p>
        </div>

        <Card className="flex flex-col gap-3 text-center">
          <Selo variante="terracota">Assine pra desbloquear</Selo>
          <p className="text-sm text-tinta-suave">
            Finanças sem planilha, tarefas e compras organizadas sozinhas, chat com o Prontim,
            Marketplace e um resumo do seu dia todo dia de manhã.
          </p>
          <Link href="/app/para-voce">
            <Botao type="button" className="w-full">
              Ver tudo que você ganha
            </Botao>
          </Link>
        </Card>

        <Varal />
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-md flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Início</h1>
        <p className="text-tinta-suave">Seus destaques por aqui, prontinho.</p>
      </div>

      {nivel === "base" && (
        <Card className="flex flex-col gap-2 border-2 border-amarelo/40">
          <div className="flex items-center justify-between">
            <Selo variante="amarelo">Premium</Selo>
            <Link
              href="/app/para-voce"
              className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
            >
              Ver mais →
            </Link>
          </div>
          <p className="text-sm text-tinta-suave">
            Faz upgrade pro Premium e leva o Prontim pro WhatsApp: despesa por texto ou áudio,
            foto do prato pras calorias, tarefa e compra direto no zap.
          </p>
        </Card>
      )}

      <Card className="flex flex-col gap-2">
        <Selo variante="verde">Resumo do dia</Selo>
        {briefing ? (
          <>
            <p className="text-xs text-tinta-suave">{formatarDataHora(briefing.created_at)}</p>
            <p className="whitespace-pre-wrap text-sm text-tinta">{briefing.mensagem}</p>
          </>
        ) : (
          <p className="text-sm text-tinta-suave">
            Assim que você tiver movimento no Quintal de Finanças, o Prontim monta um resumo aqui
            todo dia.
          </p>
        )}
      </Card>

      {(tarefasAbertas.length > 0 || comprasAbertas.length > 0) && (
        <Card className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <Selo variante="verde">Pendências</Selo>
            <Link
              href="/app/tarefas"
              className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
            >
              Ver tudo →
            </Link>
          </div>

          {tarefasAbertas.length > 0 && (
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-tinta">
                Tarefas em aberto ({tarefasAbertas.length})
              </h2>
              <ul className="flex flex-col gap-1">
                {tarefasAbertas.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm text-tinta-suave">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-verde" />
                    <span className="truncate">
                      {item.texto}
                      {item.prazo && (
                        <span className="text-xs"> — {formatarDataHora(item.prazo)}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {comprasAbertas.length > 0 && (
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold text-tinta">
                Lista de compras ({comprasAbertas.length})
              </h2>
              <ul className="flex flex-col gap-1">
                {comprasAbertas.slice(0, 4).map((item) => (
                  <li key={item.id} className="flex items-center gap-2 text-sm text-tinta-suave">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-verde" />
                    <span className="truncate">
                      {item.texto}
                      {item.quantidade && <span className="text-xs"> — {item.quantidade}</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      {planoHabitos && (
        <Card className="flex flex-col gap-2">
          <Selo variante="verde">Teu plano de hábitos</Selo>
          <p className="text-sm text-tinta-suave">Do diagnóstico que o Prontim montou pra ti.</p>
          <ul className="flex flex-col gap-2 pt-1">
            {planoHabitos.plano.map((habito, indice) => (
              <li key={indice} className="flex gap-2 text-sm text-tinta">
                <span className="text-verde-escuro">✓</span>
                <span>{habito}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/marketplace/personal-trainer"
            className="pt-1 font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            Encontrar um personal trainer perto de você →
          </Link>
        </Card>
      )}

      <Card className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Selo variante="verde">Favoritos</Selo>
          <Link
            href="/app/catalogo"
            className="font-titulo text-sm font-semibold text-verde-escuro underline underline-offset-2"
          >
            {appsFavoritos.length > 0 ? "Editar →" : "Escolher →"}
          </Link>
        </div>
        <h2 className="text-lg font-bold text-tinta">Seus mini-apps favoritos</h2>
        {appsFavoritos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {appsFavoritos.map((app) => {
              const liberado = !app.minimoPF || nivelAtende(nivel, app.minimoPF);
              return (
                <Link
                  key={app.id}
                  href={liberado ? app.href : "/app/para-voce"}
                  className="flex items-center gap-2 rounded-lg bg-papel-2 px-3 py-2 text-sm font-semibold text-tinta"
                >
                  <span>{app.icone}</span>
                  <span className="truncate">{app.nome}</span>
                  {!liberado && <span className="ml-auto text-xs">🔒</span>}
                </Link>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-tinta-suave">
            Marca a estrelinha ⭐ nos mini-apps que você mais usa lá no Catálogo, e eles aparecem
            aqui como atalho.
          </p>
        )}
      </Card>
    </div>
  );
}
