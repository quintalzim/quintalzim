-- Inscrições de push notification (PWA)
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query

-- 1. Cria a tabela push_subscriptions (idempotente)
CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS push_subscriptions_profile_id_idx
  ON public.push_subscriptions (profile_id);

-- 2. RLS: cada usuário só vê/gerencia as próprias inscrições
--    (o envio de verdade usa a service role key, que ignora RLS)
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'push_subscriptions' AND policyname = 'push_subscriptions_all_own'
  ) THEN
    CREATE POLICY push_subscriptions_all_own ON public.push_subscriptions
      FOR ALL TO authenticated
      USING (auth.uid() = profile_id)
      WITH CHECK (auth.uid() = profile_id);
  END IF;
END $$;
