-- Recepcionista IA v1: pedidos de horário do cliente final
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query
-- Pré-requisito: já ter rodado criar-tabela-empresas.sql e plano-b-cliente-final.sql

CREATE TABLE IF NOT EXISTS public.agendamentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  cliente_profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_cliente text,
  telefone_cliente text,
  servico text,
  data_hora_desejada timestamptz NOT NULL,
  observacao text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS agendamentos_empresa_id_idx ON public.agendamentos (empresa_id);
CREATE INDEX IF NOT EXISTS agendamentos_cliente_profile_id_idx ON public.agendamentos (cliente_profile_id);

ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agendamentos' AND policyname = 'agendamentos_insert_cliente'
  ) THEN
    CREATE POLICY agendamentos_insert_cliente ON public.agendamentos
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = cliente_profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agendamentos' AND policyname = 'agendamentos_select_cliente'
  ) THEN
    CREATE POLICY agendamentos_select_cliente ON public.agendamentos
      FOR SELECT TO authenticated
      USING (auth.uid() = cliente_profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agendamentos' AND policyname = 'agendamentos_select_owner'
  ) THEN
    CREATE POLICY agendamentos_select_owner ON public.agendamentos
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = agendamentos.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'agendamentos' AND policyname = 'agendamentos_update_owner'
  ) THEN
    CREATE POLICY agendamentos_update_owner ON public.agendamentos
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = agendamentos.empresa_id AND e.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = agendamentos.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
