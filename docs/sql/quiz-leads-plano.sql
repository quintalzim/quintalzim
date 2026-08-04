-- Quiz-Funil: plano de hábitos. Adiciona o plano gerado junto com o
-- diagnóstico, e um profile_id pra ligar o lead ao cadastro quando a
-- pessoa virar assinante (o vínculo é feito por e-mail, em /app/inicio).
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query

ALTER TABLE public.quiz_leads
  ADD COLUMN IF NOT EXISTS plano_habitos jsonb,
  ADD COLUMN IF NOT EXISTS profile_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS quiz_leads_profile_id_idx ON public.quiz_leads (profile_id);
