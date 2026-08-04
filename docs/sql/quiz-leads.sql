-- Quiz-Funil v1 (saúde/fitness): leads capturados no quiz público, com o
-- diagnóstico gerado pelo Prontim. Não cria conta de usuário — é só o
-- funil de aquisição; a conversão em assinante acontece depois, em /entrar.
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query

CREATE TABLE IF NOT EXISTS public.quiz_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz text NOT NULL DEFAULT 'saude-fitness',
  nome text NOT NULL,
  email text NOT NULL,
  whatsapp text,
  respostas jsonb NOT NULL,
  diagnostico text,
  plano_sugerido text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS quiz_leads_email_idx ON public.quiz_leads (email);
CREATE INDEX IF NOT EXISTS quiz_leads_quiz_idx ON public.quiz_leads (quiz);

-- RLS ligado, sem policy nenhuma: só a service role (usada pela rota
-- /api/quiz/diagnostico) lê/escreve. Ninguém acessa isso direto do navegador.
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;
