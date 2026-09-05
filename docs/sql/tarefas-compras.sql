-- Tarefas & Compras: módulo pra substituir a anotação solta no celular do
-- assinante (PF ou dono de Empresa). Uma tabela só cobre os dois tipos —
-- mesmo raciocínio já usado em produtos_empresa (produto/serviço via `tipo`).
-- Sem conceito de "lista nomeada" no v1: só os dois grupos fixos tarefa/compra.
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query

CREATE TABLE IF NOT EXISTS public.itens_lista (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo text NOT NULL CHECK (tipo IN ('tarefa', 'compra')),
  texto text NOT NULL,
  quantidade text,
  concluido boolean NOT NULL DEFAULT false,
  prazo timestamptz,
  prioridade text CHECK (prioridade IN ('baixa', 'media', 'alta')),
  origem text NOT NULL DEFAULT 'manual' CHECK (origem IN ('manual', 'ia')),
  lembrete_enviado boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS itens_lista_profile_id_idx ON public.itens_lista (profile_id);
CREATE INDEX IF NOT EXISTS itens_lista_profile_id_tipo_idx ON public.itens_lista (profile_id, tipo);

ALTER TABLE public.itens_lista ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'itens_lista' AND policyname = 'itens_lista_select_own'
  ) THEN
    CREATE POLICY itens_lista_select_own ON public.itens_lista
      FOR SELECT TO authenticated
      USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'itens_lista' AND policyname = 'itens_lista_insert_own'
  ) THEN
    CREATE POLICY itens_lista_insert_own ON public.itens_lista
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'itens_lista' AND policyname = 'itens_lista_update_own'
  ) THEN
    CREATE POLICY itens_lista_update_own ON public.itens_lista
      FOR UPDATE TO authenticated
      USING (auth.uid() = profile_id)
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'itens_lista' AND policyname = 'itens_lista_delete_own'
  ) THEN
    CREATE POLICY itens_lista_delete_own ON public.itens_lista
      FOR DELETE TO authenticated
      USING (auth.uid() = profile_id);
  END IF;
END $$;
