-- Separação de papéis: assinante (acesso completo) vs cliente final de uma
-- Empresa via Plano B (acesso restrito, só até ele pedir pra conhecer o resto).
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS acesso_portal text NOT NULL DEFAULT 'completo';

-- 'completo': assinante normal (login direto em /entrar), vê o portal inteiro.
-- 'restrito': nasceu como cliente final via /b/slug — só vê os próprios
--             agendamentos até pedir pra conhecer o resto (aí vira 'completo').

-- Backfill: contas de teste que já eram cliente final de alguma empresa antes
-- dessa correção existir (e nunca foram donas de empresa nenhuma) passam a
-- 'restrito' também, em vez de ficar destravadas por acidente.
UPDATE public.profiles p
SET acesso_portal = 'restrito'
WHERE EXISTS (SELECT 1 FROM public.empresa_clientes ec WHERE ec.profile_id = p.id)
  AND NOT EXISTS (SELECT 1 FROM public.empresas e WHERE e.owner_id = p.id);
