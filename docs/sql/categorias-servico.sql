-- Categorias de Serviço do Marketplace (seção 3 do doc de contexto, v1.21).
-- Generaliza o Marketplace, que até aqui só existia pra "Personal Trainer"
-- hardcoded no código, pra um catálogo de tipos de serviço administrável
-- pelo fundador (pintor, pedreiro, faxineira, etc.), sem precisar criar
-- página nova nem alterar código a cada novo serviço.
--
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query
-- Pré-requisito: já ter rodado docs/sql/marketplace.sql (profissionais_marketplace
-- e demandas_marketplace já precisam existir).

-- 1) Tabela de categorias, administrada pelo fundador em /app/admin.
CREATE TABLE IF NOT EXISTS public.categorias_servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  nome text NOT NULL,
  descricao text,
  emoji text,
  ativo boolean NOT NULL DEFAULT true,
  ordem integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.categorias_servico ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  -- Leitura pública liberada pra todo mundo (inclusive categoria inativa —
  -- quem decide o que exibir é a query da página, não a RLS; não é dado
  -- sensível, é só o catálogo de tipos de serviço). Escrita só via
  -- clienteAdmin() (service role, bypassa RLS), chamada pelas rotas do
  -- admin que já checam ehSuperadmin() antes — por isso não existe policy
  -- de INSERT/UPDATE/DELETE aqui: fica bloqueado por padrão pra
  -- anon/authenticated.
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'categorias_servico' AND policyname = 'categorias_servico_select_public'
  ) THEN
    CREATE POLICY categorias_servico_select_public ON public.categorias_servico
      FOR SELECT TO anon, authenticated
      USING (true);
  END IF;
END $$;

-- 2) Seed com categorias iniciais, pra tabela não ficar vazia (facilita
-- teste e já cobre o caso real que existia — Personal Trainer).
INSERT INTO public.categorias_servico (slug, nome, descricao, emoji, ordem) VALUES
  ('personal-trainer', 'Personal Trainer', 'Treino presencial ou acompanhamento fitness.', '🏋️', 10),
  ('pintor', 'Pintor', 'Pintura residencial e comercial.', '🎨', 20),
  ('pedreiro', 'Pedreiro', 'Reforma, alvenaria e obras em geral.', '🧱', 30),
  ('eletricista', 'Eletricista', 'Instalação e reparo elétrico.', '💡', 40),
  ('encanador', 'Encanador', 'Instalação e reparo hidráulico.', '🔧', 50),
  ('diarista', 'Diarista / Faxineira', 'Limpeza residencial e comercial.', '🧹', 60),
  ('jardinagem', 'Jardinagem', 'Manutenção de jardim e paisagismo.', '🌱', 70),
  ('cabeleireiro', 'Cabeleireiro(a)', 'Corte, coloração e tratamentos capilares.', '💇', 80),
  ('manicure', 'Manicure / Pedicure', 'Cuidados com unhas, a domicílio ou em salão.', '💅', 90),
  ('cuidador-idosos', 'Cuidador(a) de Idosos', 'Acompanhamento e cuidado de pessoas idosas.', '🤝', 100)
ON CONFLICT (slug) DO NOTHING;

-- 3) profissionais_marketplace: troca a coluna `categoria` (texto livre,
-- sempre valia 'personal_trainer' na prática) por uma FK de verdade.
ALTER TABLE public.profissionais_marketplace
  ADD COLUMN IF NOT EXISTS categoria_id uuid REFERENCES public.categorias_servico(id);

-- Migra as linhas existentes (até aqui, 100% delas com categoria='personal_trainer').
UPDATE public.profissionais_marketplace p
SET categoria_id = c.id
FROM public.categorias_servico c
WHERE p.categoria_id IS NULL
  AND replace(p.categoria, '_', '-') = c.slug;

-- Segurança: se sobrar alguma linha sem categoria_id (categoria antiga que
-- não bate com nenhum slug cadastrado), joga pra "personal-trainer" em vez
-- de travar o NOT NULL abaixo — ajuste manualmente depois se necessário.
UPDATE public.profissionais_marketplace p
SET categoria_id = (SELECT id FROM public.categorias_servico WHERE slug = 'personal-trainer')
WHERE p.categoria_id IS NULL;

ALTER TABLE public.profissionais_marketplace
  ALTER COLUMN categoria_id SET NOT NULL;

DROP INDEX IF EXISTS profissionais_marketplace_categoria_idx;
CREATE INDEX IF NOT EXISTS profissionais_marketplace_categoria_id_idx ON public.profissionais_marketplace (categoria_id);

ALTER TABLE public.profissionais_marketplace DROP COLUMN IF EXISTS categoria;

-- 4) demandas_marketplace: mesma ideia, mas categoria_id fica opcional —
-- a IA do n8n (workflow "Estruturar Demanda") passa a escolher dentro do
-- catálogo cadastrado, mas se não conseguir classificar com confiança,
-- pode deixar em branco em vez de inventar uma categoria inexistente.
ALTER TABLE public.demandas_marketplace
  ADD COLUMN IF NOT EXISTS categoria_id uuid REFERENCES public.categorias_servico(id);

UPDATE public.demandas_marketplace d
SET categoria_id = c.id
FROM public.categorias_servico c
WHERE d.categoria_id IS NULL
  AND d.categoria IS NOT NULL
  AND (lower(d.categoria) = c.slug OR replace(lower(d.categoria), '_', '-') = c.slug);

CREATE INDEX IF NOT EXISTS demandas_marketplace_categoria_id_idx ON public.demandas_marketplace (categoria_id);

-- A coluna antiga `categoria` (texto livre) fica mantida como fallback de
-- exibição pra demandas antigas que a IA não conseguiu casar com nenhuma
-- categoria cadastrada (ex.: pedido muito específico/atípico) — não é mais
-- escrita pelo workflow novo, só lida.
COMMENT ON COLUMN public.demandas_marketplace.categoria IS
  'Legado (texto livre, IA antiga). Preferir categoria_id — mantido só como fallback de exibição pra demandas antigas sem categoria_id.';
