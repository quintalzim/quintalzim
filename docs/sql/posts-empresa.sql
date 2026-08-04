-- Posts automáticos diários (camada 3 da esteira Empresa): texto de post
-- gerado pela IA com dados reais da Vitrine, pronto pra copiar.
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query
-- Pré-requisito: já ter rodado criar-tabela-empresas.sql

CREATE TABLE IF NOT EXISTS public.posts_empresa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  conteudo text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS posts_empresa_empresa_id_idx ON public.posts_empresa (empresa_id);

ALTER TABLE public.posts_empresa ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'posts_empresa' AND policyname = 'posts_empresa_select_owner'
  ) THEN
    CREATE POLICY posts_empresa_select_owner ON public.posts_empresa
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = posts_empresa.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
