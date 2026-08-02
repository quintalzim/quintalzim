-- Mapeamento telefone → user_id (Prontim / Extrator de Despesas)
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query

-- 1. Adiciona a coluna de telefone na tabela profiles (idempotente)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text;

-- 2. Garante telefone único (mais de um usuário não pode ter o mesmo número)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_key
  ON public.profiles (phone) WHERE phone IS NOT NULL;

-- 3. Garante que o próprio usuário logado pode inserir/atualizar sua linha
--    (necessário pro formulário de "vincular WhatsApp" no perfil funcionar)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'profiles' AND policyname = 'profiles_upsert_own'
  ) THEN
    CREATE POLICY profiles_upsert_own ON public.profiles
      FOR ALL
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 4. Vincula seu próprio telefone (o número que manda mensagem pro Prontim)
--    Ajuste o número abaixo se não for esse.
INSERT INTO public.profiles (id, phone)
VALUES ('a95ce74f-efed-49e6-9eb0-27b250d3d799', '5511989405071')
ON CONFLICT (id) DO UPDATE SET phone = EXCLUDED.phone;
