-- Assinatura PF via Asaas (MVP: só PF Base, Pix recorrente).
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query

-- CPF é dado próprio do usuário, baixo risco de ele mesmo editar — fica em
-- profiles, já coberto pela policy profiles_upsert_own existente.
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cpf text;

-- O status da assinatura NÃO pode ficar em profiles: a policy
-- profiles_upsert_own é `FOR ALL` (auth.uid() = id), então qualquer usuário
-- logado poderia escrever assinatura_status='ativa' direto pelo client do
-- navegador sem pagar nada. Por isso vira tabela própria, só com policy de
-- SELECT pro dono — toda escrita (criar/atualizar status) passa pela service
-- role (clienteAdmin(), nas rotas /api/asaas/*), mesmo padrão de segurança já
-- usado em quiz_leads.
CREATE TABLE IF NOT EXISTS public.assinaturas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  asaas_customer_id text,
  asaas_subscription_id text,
  plano text NOT NULL DEFAULT 'pf_base',
  -- status: 'pendente' (aguardando 1º pagamento) | 'ativa' | 'inadimplente' | 'cancelada'
  status text NOT NULL DEFAULT 'pendente',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.assinaturas ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'assinaturas' AND policyname = 'assinaturas_select_own'
  ) THEN
    CREATE POLICY assinaturas_select_own ON public.assinaturas
      FOR SELECT TO authenticated
      USING (auth.uid() = profile_id);
  END IF;
  -- De propósito: nenhuma policy de INSERT/UPDATE/DELETE pra authenticated.
  -- Só a service role (que ignora RLS) escreve nessa tabela.
END $$;
