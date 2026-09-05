-- Marketplace v1 (seção 3 do doc de contexto): duas partes.
-- (1) Perfis fixos — diretório de profissionais (estreia com personal trainers).
-- (2) Balcão de Demandas — cliente publica o que precisa, profissionais se
--     interessam. Sem pagamento/checkout, sem geolocalização real ainda
--     (campo "cidade"/"local" é texto livre); verificação de cadastro
--     (doc+selfie) fica pra depois — v1 usa uma coluna `verificado` que só o
--     fundador vira manualmente pelo Supabase por enquanto.
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query
-- Pré-requisito: já ter rodado plano-b-cliente-final.sql (tabela empresa_clientes
-- não é usada aqui, mas o padrão de auth.users já precisa existir)

CREATE TABLE IF NOT EXISTS public.profissionais_marketplace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria text NOT NULL DEFAULT 'personal_trainer',
  nome text NOT NULL,
  descricao text,
  cidade text,
  contato text,
  instagram text,
  verificado boolean NOT NULL DEFAULT false,
  ativo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS profissionais_marketplace_categoria_idx ON public.profissionais_marketplace (categoria);

ALTER TABLE public.profissionais_marketplace ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profissionais_marketplace' AND policyname = 'profissionais_marketplace_select_public'
  ) THEN
    CREATE POLICY profissionais_marketplace_select_public ON public.profissionais_marketplace
      FOR SELECT TO anon, authenticated
      USING (ativo = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profissionais_marketplace' AND policyname = 'profissionais_marketplace_select_own'
  ) THEN
    CREATE POLICY profissionais_marketplace_select_own ON public.profissionais_marketplace
      FOR SELECT TO authenticated
      USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profissionais_marketplace' AND policyname = 'profissionais_marketplace_insert_own'
  ) THEN
    CREATE POLICY profissionais_marketplace_insert_own ON public.profissionais_marketplace
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profissionais_marketplace' AND policyname = 'profissionais_marketplace_update_own'
  ) THEN
    CREATE POLICY profissionais_marketplace_update_own ON public.profissionais_marketplace
      FOR UPDATE TO authenticated
      USING (auth.uid() = profile_id)
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profissionais_marketplace' AND policyname = 'profissionais_marketplace_delete_own'
  ) THEN
    CREATE POLICY profissionais_marketplace_delete_own ON public.profissionais_marketplace
      FOR DELETE TO authenticated
      USING (auth.uid() = profile_id);
  END IF;
END $$;

-- Balcão de Demandas: pedido pontual do cliente, em linguagem natural,
-- estruturado por IA (categoria/local/prazo) no momento da publicação.
CREATE TABLE IF NOT EXISTS public.demandas_marketplace (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  autor_profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  categoria text,
  descricao text NOT NULL,
  local text,
  prazo text,
  valor_oferecido numeric,
  status text NOT NULL DEFAULT 'aberta',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS demandas_marketplace_status_idx ON public.demandas_marketplace (status);
CREATE INDEX IF NOT EXISTS demandas_marketplace_autor_idx ON public.demandas_marketplace (autor_profile_id);

ALTER TABLE public.demandas_marketplace ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'demandas_marketplace' AND policyname = 'demandas_marketplace_select_publico'
  ) THEN
    -- Demandas abertas são um mural público (qualquer profissional pode ver
    -- sem precisar já estar vinculado a nada)
    CREATE POLICY demandas_marketplace_select_publico ON public.demandas_marketplace
      FOR SELECT TO anon, authenticated
      USING (status = 'aberta');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'demandas_marketplace' AND policyname = 'demandas_marketplace_select_autor'
  ) THEN
    CREATE POLICY demandas_marketplace_select_autor ON public.demandas_marketplace
      FOR SELECT TO authenticated
      USING (auth.uid() = autor_profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'demandas_marketplace' AND policyname = 'demandas_marketplace_insert_autor'
  ) THEN
    CREATE POLICY demandas_marketplace_insert_autor ON public.demandas_marketplace
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = autor_profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'demandas_marketplace' AND policyname = 'demandas_marketplace_update_autor'
  ) THEN
    CREATE POLICY demandas_marketplace_update_autor ON public.demandas_marketplace
      FOR UPDATE TO authenticated
      USING (auth.uid() = autor_profile_id)
      WITH CHECK (auth.uid() = autor_profile_id);
  END IF;
END $$;

-- Interesses: um profissional manifesta interesse numa demanda aberta.
CREATE TABLE IF NOT EXISTS public.interesses_demanda (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  demanda_id uuid NOT NULL REFERENCES public.demandas_marketplace(id) ON DELETE CASCADE,
  profissional_profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_interessado text,
  contato_interessado text,
  mensagem text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (demanda_id, profissional_profile_id)
);

CREATE INDEX IF NOT EXISTS interesses_demanda_demanda_id_idx ON public.interesses_demanda (demanda_id);

ALTER TABLE public.interesses_demanda ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'interesses_demanda' AND policyname = 'interesses_demanda_insert_profissional'
  ) THEN
    CREATE POLICY interesses_demanda_insert_profissional ON public.interesses_demanda
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = profissional_profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'interesses_demanda' AND policyname = 'interesses_demanda_select_profissional'
  ) THEN
    CREATE POLICY interesses_demanda_select_profissional ON public.interesses_demanda
      FOR SELECT TO authenticated
      USING (auth.uid() = profissional_profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'interesses_demanda' AND policyname = 'interesses_demanda_select_autor_demanda'
  ) THEN
    -- Autor da demanda vê quem se interessou, pra escolher com quem falar
    CREATE POLICY interesses_demanda_select_autor_demanda ON public.interesses_demanda
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.demandas_marketplace d
          WHERE d.id = interesses_demanda.demanda_id AND d.autor_profile_id = auth.uid()
        )
      );
  END IF;
END $$;
