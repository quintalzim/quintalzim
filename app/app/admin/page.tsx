import Card from "@/components/ui/Card";
import Selo from "@/components/ui/Selo";
import { ehSuperadmin } from "@/lib/admin/auth";
import { buscarDadosAdmin } from "@/lib/admin/dashboard";
import { clienteAdmin } from "@/lib/push-servidor";
import { createClient } from "@/lib/supabase/server";

// Painel de controle geral — só superadmin (profiles.role='admin') acessa.
// Sem PostHog (decisão do usuário), essa página é a visão consolidada de
// contas/atividade da plataforma inteira, lendo direto do Supabase via
// service role.

function formatarReais(valor: number): string {
  return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatarData(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  } catch {
    return iso;
  }
}

export default async function AdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3">
        <p className="text-tinta-suave">Essa página é restrita.</p>
      </div>
    );
  }

  const { data: perfil } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  if (!ehSuperadmin(perfil?.role)) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3">
        <p className="text-tinta-suave">Essa página é restrita.</p>
      </div>
    );
  }

  const admin = clienteAdmin();
  if (!admin) {
    return (
      <div className="mx-auto flex max-w-md flex-col gap-3">
        <p className="text-tinta-suave">Painel indisponível (variáveis de servidor não configuradas).</p>
      </div>
    );
  }

  const dados = await buscarDadosAdmin(admin);

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <div>
        <h1 className="text-2xl font-extrabold text-tinta">Painel de Controle</h1>
        <p className="text-tinta-suave">Visão geral de contas e atividade da plataforma.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="flex flex-col gap-1">
          <p className="text-xs text-tinta-suave">Contas totais</p>
          <p className="text-2xl font-extrabold text-tinta">{dados.contas.totalUsuarios}</p>
        </Card>
        <Card className="flex flex-col gap-1">
          <p className="text-xs text-tinta-suave">Assinantes</p>
          <p className="text-2xl font-extrabold text-verde-escuro">{dados.contas.assinantesCompletos}</p>
        </Card>
        <Card className="flex flex-col gap-1">
          <p className="text-xs text-tinta-suave">Clientes finais</p>
          <p className="text-2xl font-extrabold text-tinta">{dados.contas.clientesRestritos}</p>
        </Card>
        <Card className="flex flex-col gap-1">
          <p className="text-xs text-tinta-suave">Empresas</p>
          <p className="text-2xl font-extrabold text-tinta">{dados.empresas.total}</p>
        </Card>
      </div>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Leads (Quiz-Funil)</Selo>
        <div className="flex items-center justify-between text-sm">
          <span className="text-tinta-suave">Total capturado</span>
          <span className="font-semibold text-tinta">{dados.leads.total}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-tinta-suave">Converteram em assinante</span>
          <span className="font-semibold text-verde-escuro">
            {dados.leads.convertidos} (
            {dados.leads.total > 0
              ? Math.round((dados.leads.convertidos / dados.leads.total) * 100)
              : 0}
            %)
          </span>
        </div>
        {dados.leads.porFunil.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-papel-2 pt-2">
            <p className="text-xs font-semibold text-tinta-suave">Por funil</p>
            {dados.leads.porFunil.map((f) => (
              <div key={f.funil} className="flex items-center justify-between text-sm">
                <span className="text-tinta-suave">{f.funil}</span>
                <span className="font-semibold text-tinta">{f.quantidade}</span>
              </div>
            ))}
          </div>
        )}
        {dados.leads.recentes.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-papel-2 pt-2">
            <p className="text-xs font-semibold text-tinta-suave">Últimos 20</p>
            {dados.leads.recentes.map((lead, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="text-tinta">
                  {lead.nome} — {lead.email}
                </span>
                <span className={lead.convertido ? "font-semibold text-verde-escuro" : "text-tinta-suave"}>
                  {lead.convertido ? "convertido" : formatarData(lead.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Empresas cadastradas</Selo>
        {dados.empresas.lista.length === 0 ? (
          <p className="text-sm text-tinta-suave">Nenhuma Empresa cadastrada ainda.</p>
        ) : (
          <div className="flex flex-col gap-1">
            {dados.empresas.lista.map((e) => (
              <div key={e.id} className="flex items-center justify-between text-sm">
                <span className="text-tinta">{e.nome}</span>
                <span className="text-xs text-tinta-suave">
                  {e.slug ? `/b/${e.slug}` : "sem slug"} — {formatarData(e.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Marketplace — Perfis fixos</Selo>
        <div className="flex items-center justify-between text-sm">
          <span className="text-tinta-suave">Total de profissionais</span>
          <span className="font-semibold text-tinta">{dados.marketplace.totalProfissionais}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-tinta-suave">Verificados</span>
          <span className="font-semibold text-verde-escuro">{dados.marketplace.verificados}</span>
        </div>
        {dados.marketplace.porCategoria.map((c) => (
          <div key={c.categoria} className="flex items-center justify-between text-xs text-tinta-suave">
            <span>{c.categoria}</span>
            <span>{c.quantidade}</span>
          </div>
        ))}
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Marketplace — Balcão de Demandas</Selo>
        {dados.marketplace.demandasPorStatus.length === 0 ? (
          <p className="text-sm text-tinta-suave">Nenhuma demanda publicada ainda.</p>
        ) : (
          dados.marketplace.demandasPorStatus.map((d) => (
            <div key={d.status} className="flex items-center justify-between text-sm">
              <span className="text-tinta-suave capitalize">{d.status}</span>
              <span className="font-semibold text-tinta">{d.quantidade}</span>
            </div>
          ))
        )}
        <div className="flex items-center justify-between border-t border-papel-2 pt-2 text-sm">
          <span className="text-tinta-suave">Total de interesses manifestados</span>
          <span className="font-semibold text-tinta">{dados.marketplace.totalInteresses}</span>
        </div>
        {dados.marketplace.ranking.length > 0 && (
          <div className="flex flex-col gap-1 border-t border-papel-2 pt-2">
            <p className="text-xs font-semibold text-tinta-suave">Quem mais ofereceu ajuda</p>
            {dados.marketplace.ranking.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <span className="text-tinta">{r.nome}</span>
                <span className="font-semibold text-tinta">{r.quantidade}</span>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className="flex flex-col gap-3">
        <Selo variante="verde">Atividade comercial (plataforma inteira)</Selo>
        <div className="flex items-center justify-between text-sm">
          <span className="text-tinta-suave">
            Agendamentos confirmados ({dados.atividadeComercial.agendamentosConfirmados})
          </span>
          <span className="font-semibold text-verde-escuro">
            {formatarReais(dados.atividadeComercial.receitaAgendamentos)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-tinta-suave">
            Pedidos de Catálogo confirmados ({dados.atividadeComercial.pedidosCatalogoConfirmados})
          </span>
          <span className="font-semibold text-verde-escuro">
            {formatarReais(dados.atividadeComercial.receitaCatalogo)}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-papel-2 pt-2 text-sm">
          <span className="font-semibold text-tinta">Total movimentado via Empresas</span>
          <span className="font-bold text-tinta">
            {formatarReais(
              dados.atividadeComercial.receitaAgendamentos + dados.atividadeComercial.receitaCatalogo
            )}
          </span>
        </div>
      </Card>
    </div>
  );
}
