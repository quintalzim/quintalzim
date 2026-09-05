-- Gestão/DRE da Empresa v1: valor do serviço, preenchido pelo dono ao
-- confirmar um agendamento. Vira a fonte de receita do DRE (não existe
-- Catálogo/Loja ainda, então agendamento confirmado é a "venda" possível hoje).
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query

ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS valor numeric;
