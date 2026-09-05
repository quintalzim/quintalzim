-- Catálogo & Loja (camada 5 da Vitrine do Cliente): produtos/serviços da
-- Empresa + pedidos feitos pelo cliente final pela Vitrine pública.
-- v1 = "comércio conversacional": cliente pede, dono confirma manualmente
-- (sem estoque, sem pagamento online — isso é Fase 2, junto com Asaas).
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query
-- Pré-requisito: já ter rodado criar-tabela-empresas.sql e plano-b-cliente-final.sql

CREATE TABLE IF NOT EXISTS public.produtos_empresa (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  nome text NOT NULL,
  descricao text,
  preco numeric,
  tipo text NOT NULL DEFAULT 'produto' CHECK (tipo IN ('produto', 'servico')),
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS produtos_empresa_empresa_id_idx ON public.produtos_empresa (empresa_id);

ALTER TABLE public.produtos_empresa ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'produtos_empresa' AND policyname = 'produtos_empresa_select_public'
  ) THEN
    -- Vitrine pública só mostra itens ativos, pra quem não é dono
    CREATE POLICY produtos_empresa_select_public ON public.produtos_empresa
      FOR SELECT TO anon, authenticated
      USING (ativo = true);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'produtos_empresa' AND policyname = 'produtos_empresa_select_owner'
  ) THEN
    -- Dono vê tudo, inclusive inativos, no próprio painel
    CREATE POLICY produtos_empresa_select_owner ON public.produtos_empresa
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = produtos_empresa.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'produtos_empresa' AND policyname = 'produtos_empresa_insert_owner'
  ) THEN
    CREATE POLICY produtos_empresa_insert_owner ON public.produtos_empresa
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = produtos_empresa.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'produtos_empresa' AND policyname = 'produtos_empresa_update_owner'
  ) THEN
    CREATE POLICY produtos_empresa_update_owner ON public.produtos_empresa
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = produtos_empresa.empresa_id AND e.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = produtos_empresa.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'produtos_empresa' AND policyname = 'produtos_empresa_delete_owner'
  ) THEN
    CREATE POLICY produtos_empresa_delete_owner ON public.produtos_empresa
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = produtos_empresa.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Pedidos feitos pelo cliente final pela Vitrine. Guarda nome/preço do
-- produto no momento do pedido (snapshot), pra não quebrar histórico se o
-- dono editar ou apagar o item depois.
CREATE TABLE IF NOT EXISTS public.pedidos_catalogo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  produto_id uuid REFERENCES public.produtos_empresa(id) ON DELETE SET NULL,
  cliente_profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_produto text NOT NULL,
  preco_unitario numeric,
  quantidade integer NOT NULL DEFAULT 1,
  nome_cliente text,
  telefone_cliente text,
  observacao text,
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS pedidos_catalogo_empresa_id_idx ON public.pedidos_catalogo (empresa_id);
CREATE INDEX IF NOT EXISTS pedidos_catalogo_cliente_profile_id_idx ON public.pedidos_catalogo (cliente_profile_id);

ALTER TABLE public.pedidos_catalogo ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pedidos_catalogo' AND policyname = 'pedidos_catalogo_insert_cliente'
  ) THEN
    CREATE POLICY pedidos_catalogo_insert_cliente ON public.pedidos_catalogo
      FOR INSERT TO authenticated
      WITH CHECK (auth.uid() = cliente_profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pedidos_catalogo' AND policyname = 'pedidos_catalogo_select_cliente'
  ) THEN
    CREATE POLICY pedidos_catalogo_select_cliente ON public.pedidos_catalogo
      FOR SELECT TO authenticated
      USING (auth.uid() = cliente_profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pedidos_catalogo' AND policyname = 'pedidos_catalogo_select_owner'
  ) THEN
    CREATE POLICY pedidos_catalogo_select_owner ON public.pedidos_catalogo
      FOR SELECT TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = pedidos_catalogo.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'pedidos_catalogo' AND policyname = 'pedidos_catalogo_update_owner'
  ) THEN
    CREATE POLICY pedidos_catalogo_update_owner ON public.pedidos_catalogo
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = pedidos_catalogo.empresa_id AND e.owner_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.empresas e
          WHERE e.id = pedidos_catalogo.empresa_id AND e.owner_id = auth.uid()
        )
      );
  END IF;
END $$;
