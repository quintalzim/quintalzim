-- Plano B: cliente final vira usuário do Quintalzim sem depender do WhatsApp da Empresa
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query
-- Pré-requisito: já ter rodado docs/sql/criar-tabela-empresas.sql

-- 1. Permite leitura pública da tabela empresas (necessário pra página /b/[slug]
--    mostrar o nome do negócio pra quem ainda não tem login)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'empresas' AND policyname = 'empresas_select_public'
  ) THEN
    CREATE POLICY empresas_select_public ON public.empresas
      FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- 2. Cria a tabela empresa_clientes (vínculo entre um cliente final e a empresa que o trouxe)
CREATE TABLE IF NOT EXISTS public.empresa_clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text,
  telefone text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Um mesmo cliente não duplica vínculo com a mesma empresa
CREATE UNIQUE INDEX IF NOT EXISTS empresa_clientes_empresa_profile_key
  ON public.empresa_clientes (empresa_id, profile_id);

-- 4. RLS: cliente vê/insere só a própria linha; dono da empresa vê os clientes da própria empresa
ALTER TABLE public.empresa_clientes ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'empresa_clientes' AND policyname = 'empresa_clientes_insert_self'
  ) THEN
    CREATE POLICY empresa_clientes_insert_self ON public.empresa_clientes
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'empresa_clientes' AND policyname = 'empresa_clientes_select_self'
  ) THEN
    CREATE POLICY empresa_clientes_select_self ON public.empresa_clientes
      FOR SELECT TO authenticated
      USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'empresa_clientes' AND policyname = 'empresa_clientes_select_owner'
  ) THEN
    CREATE POLICY empresa_clientes_select_owner ON public.empresa_clientes
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = empresa_clientes.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
