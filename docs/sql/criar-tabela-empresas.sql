-- Tabela de Empresas (base pro wizard de onboarding de WhatsApp da Empresa)
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query

-- 1. Cria a tabela empresas (idempotente)
CREATE TABLE IF NOT EXISTS public.empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome text NOT NULL,
  slug text UNIQUE,
  whatsapp_status text NOT NULL DEFAULT 'nao_iniciado',
  whatsapp_numero text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Por enquanto, 1 empresa por dono (simplifica o MVP)
CREATE UNIQUE INDEX IF NOT EXISTS empresas_owner_id_key ON public.empresas (owner_id);

-- 3. Ativa RLS e garante que cada dono só vê/edita a própria empresa
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'empresas' AND policyname = 'empresas_select_own'
  ) THEN
    CREATE POLICY empresas_select_own ON public.empresas
      FOR SELECT TO authenticated
      USING (auth.uid() = owner_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'empresas' AND policyname = 'empresas_insert_own'
  ) THEN
    CREATE POLICY empresas_insert_own ON public.empresas
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = owner_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'empresas' AND policyname = 'empresas_update_own'
  ) THEN
    CREATE POLICY empresas_update_own ON public.empresas
      FOR UPDATE TO authenticated
      USING (auth.uid() = owner_id)
      WITH CHECK (auth.uid() = owner_id);
  END IF;
END $$;
