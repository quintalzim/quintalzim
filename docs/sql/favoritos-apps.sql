-- Favoritos de mini-apps no Início (05/set/2026)
-- Lista de app-ids que o usuário marcou como favorito, pra virar atalho
-- rápido no card "Seus mini-apps favoritos" da tela /app/inicio.
-- Ids possíveis (ver lib/apps-catalogo.ts): 'financas', 'tarefas', 'prontim',
-- 'marketplace', 'ferramentas'.

alter table public.profiles
  add column if not exists apps_favoritos text[] not null default '{}';

-- Sem policy nova: profiles já tem RLS permitindo o próprio usuário
-- atualizar sua linha (mesma policy usada por phone/cpf/name/email).
