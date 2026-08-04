-- Briefing Empresarial Diário v1: mensagem completa do dia pro dono da Empresa
-- (agenda de hoje + confirmados ontem + lembrete do post do dia) — o push é só um
-- aviso curto, o texto de verdade fica aqui.
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query

CREATE TABLE IF NOT EXISTS public.briefings_empresa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  mensagem text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS briefings_empresa_empresa_id_idx ON public.briefings_empresa (empresa_id);

ALTER TABLE public.briefings_empresa ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'briefings_empresa' AND policyname = 'briefings_empresa_select_owner'
  ) THEN
    CREATE POLICY briefings_empresa_select_owner ON public.briefings_empresa
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = briefings_empresa.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
