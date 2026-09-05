-- Clube de Assinaturas (evolução da camada 5, Catálogo & Loja): a Empresa
-- oferece um plano recorrente pros PRÓPRIOS clientes dela (ex: "Corte
-- ilimitado — R$79/mês"). Não confundir com a assinatura do Quintalzim
-- (tabela `assinaturas`) — aqui é o negócio vendendo assinatura pro cliente
-- final dele.
--
-- v1 = mesmo padrão de Agendamento e Catálogo & Loja: sem split de pagamento
-- pronto, a cobrança de verdade (Pix, cartão, dinheiro) a Empresa combina por
-- fora com o cliente; o Quintalzim só registra o plano e quem assinou, com
-- status controlado manualmente pelo dono. Zero integração de pagamento nova.
--
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query
-- Pré-requisito: já ter rodado criar-tabela-empresas.sql e plano-b-cliente-final.sql

CREATE TABLE IF NOT EXISTS public.planos_clube (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  valor numeric,
  periodicidade text NOT NULL DEFAULT 'mensal' CHECK (periodicidade IN ('mensal')),
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS planos_clube_empresa_id_idx ON public.planos_clube (empresa_id);

ALTER TABLE public.planos_clube ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'planos_clube' AND policyname = 'planos_clube_select_public'
  ) THEN
    -- Vitrine pública só mostra planos ativos, pra quem não é dono
    CREATE POLICY planos_clube_select_public ON public.planos_clube
      FOR SELECT TO anon, authenticated
      USING (ativo = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'planos_clube' AND policyname = 'planos_clube_select_owner'
  ) THEN
    -- Dono vê tudo, inclusive inativos, no próprio painel
    CREATE POLICY planos_clube_select_owner ON public.planos_clube
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = planos_clube.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'planos_clube' AND policyname = 'planos_clube_insert_owner'
  ) THEN
    CREATE POLICY planos_clube_insert_owner ON public.planos_clube
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = planos_clube.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'planos_clube' AND policyname = 'planos_clube_update_owner'
  ) THEN
    CREATE POLICY planos_clube_update_owner ON public.planos_clube
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = planos_clube.empresa_id AND e.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = planos_clube.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'planos_clube' AND policyname = 'planos_clube_delete_owner'
  ) THEN
    CREATE POLICY planos_clube_delete_owner ON public.planos_clube
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = planos_clube.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Quem pediu/está no clube. Guarda nome/valor do plano no momento do pedido
-- (snapshot), pra não quebrar histórico se o dono editar ou apagar o plano
-- depois. Status é 100% manual — o dono confirma quando recebe o pagamento
-- por fora (Pix, dinheiro, cartão na maquininha etc.).
CREATE TABLE IF NOT EXISTS public.assinaturas_clube (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  plano_id uuid REFERENCES public.planos_clube(id) ON DELETE SET NULL,
  cliente_profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_plano text NOT NULL,
  valor_plano numeric,
  nome_cliente text,
  telefone_cliente text,
  observacao text,
  status text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'ativo', 'atrasado', 'cancelado')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS assinaturas_clube_empresa_id_idx ON public.assinaturas_clube (empresa_id);
CREATE INDEX IF NOT EXISTS assinaturas_clube_cliente_profile_id_idx ON public.assinaturas_clube (cliente_profile_id);

ALTER TABLE public.assinaturas_clube ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assinaturas_clube' AND policyname = 'assinaturas_clube_insert_cliente'
  ) THEN
    CREATE POLICY assinaturas_clube_insert_cliente ON public.assinaturas_clube
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = cliente_profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assinaturas_clube' AND policyname = 'assinaturas_clube_select_cliente'
  ) THEN
    CREATE POLICY assinaturas_clube_select_cliente ON public.assinaturas_clube
      FOR SELECT TO authenticated
      USING (auth.uid() = cliente_profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assinaturas_clube' AND policyname = 'assinaturas_clube_select_owner'
  ) THEN
    CREATE POLICY assinaturas_clube_select_owner ON public.assinaturas_clube
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = assinaturas_clube.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assinaturas_clube' AND policyname = 'assinaturas_clube_update_owner'
  ) THEN
    CREATE POLICY assinaturas_clube_update_owner ON public.assinaturas_clube
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = assinaturas_clube.empresa_id AND e.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = assinaturas_clube.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
