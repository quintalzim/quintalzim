-- Campos da Vitrine (mini-site público da Empresa)
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query
-- Pré-requisito: já ter rodado docs/sql/criar-tabela-empresas.sql

ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS descricao text;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS endereco text;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS telefone_contato text;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS instagram text;
ALTER TABLE public.empresas ADD COLUMN IF NOT EXISTS horario_funcionamento text;

-- Sem mudança de RLS: as políticas empresas_update_own / empresas_select_public
-- já cobrem todas as colunas da linha.
