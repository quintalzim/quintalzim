-- Histórico do chat web do Prontim (app/app/prontim). Segue o mesmo padrão de
-- segurança já usado em `assinaturas` e `quiz_leads`: o usuário só pode LER as
-- próprias mensagens; a ESCRITA (tanto a mensagem dele quanto a resposta do
-- Prontim) acontece via clienteAdmin() na rota /api/prontim/mensagem, nunca
-- direto do navegador. Isso evita que alguém injete uma "resposta do Prontim"
-- falsa forjando um insert.

create table if not exists mensagens_prontim_web (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references auth.users(id) on delete cascade,
  autor text not null check (autor in ('usuario', 'prontim')),
  texto text not null,
  created_at timestamptz not null default now()
);

create index if not exists mensagens_prontim_web_profile_id_created_at_idx
  on mensagens_prontim_web (profile_id, created_at);

alter table mensagens_prontim_web enable row level security;

create policy mensagens_prontim_web_select_own
  on mensagens_prontim_web for select
  using (auth.uid() = profile_id);

-- Sem policy de insert/update/delete para "authenticated" — só o service role
-- (clienteAdmin()) escreve nessa tabela.
