-- Evolui a tabela `assinaturas` (criada em assinatura-asaas.sql) pra suportar
-- a escada inteira de planos: uma pessoa pode ter, ao mesmo tempo, uma
-- assinatura PF (Base ou Premium) E uma assinatura Empresa (Start/Pro/
-- Completo) E uma assinatura Profissional (marketplace) — hoje a tabela só
-- permitia 1 assinatura por usuário no total.
-- Rode este script UMA VEZ no Supabase, DEPOIS de assinatura-asaas.sql

ALTER TABLE public.assinaturas ADD COLUMN IF NOT EXISTS categoria text;

-- Backfill: a única linha que pode existir até aqui é do plano PF Base
UPDATE public.assinaturas SET categoria = 'pf' WHERE categoria IS NULL AND plano LIKE 'pf_%';
UPDATE public.assinaturas SET categoria = 'empresa' WHERE categoria IS NULL AND plano LIKE 'empresa_%';
UPDATE public.assinaturas SET categoria = 'profissional' WHERE categoria IS NULL AND plano = 'profissional';
-- Sobra genérica de segurança, não deveria acontecer
UPDATE public.assinaturas SET categoria = 'pf' WHERE categoria IS NULL;

ALTER TABLE public.assinaturas ALTER COLUMN categoria SET NOT NULL;

-- Troca a restrição de "1 assinatura por usuário" por "1 assinatura ativa
-- por categoria por usuário" (o nome da constraint antiga é o padrão gerado
-- pelo Postgres pra UNIQUE (profile_id) declarado na criação da tabela)
ALTER TABLE public.assinaturas DROP CONSTRAINT IF EXISTS assinaturas_profile_id_key;

CREATE UNIQUE INDEX IF NOT EXISTS assinaturas_profile_id_categoria_idx
  ON public.assinaturas (profile_id, categoria);

-- Sem mudança de RLS: a policy assinaturas_select_own já filtra por
-- profile_id, continua funcionando igual com múltiplas linhas por usuário.
