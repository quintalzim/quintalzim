-- Briefings Inteligentes v1 (tema Finanças): mensagem completa do dia,
-- pra ler no portal — o push é só um aviso curto, o texto de verdade fica aqui.
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query

CREATE TABLE IF NOT EXISTS public.briefings_financeiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mensagem text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS briefings_financeiros_profile_id_idx ON public.briefings_financeiros (profile_id);

ALTER TABLE public.briefings_financeiros ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'briefings_financeiros' AND policyname = 'briefings_financeiros_select_own'
  ) THEN
    CREATE POLICY briefings_financeiros_select_own ON public.briefings_financeiros
      FOR SELECT TO authenticated
      USING (auth.uid() = profile_id);
  END IF;
END $$;
