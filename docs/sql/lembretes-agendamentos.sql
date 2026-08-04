-- Automação de lembretes push (24h e 2h antes do agendamento confirmado)
-- Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor → New query
-- Pré-requisito: já ter rodado agendamentos.sql

ALTER TABLE public.agendamentos
  ADD COLUMN IF NOT EXISTS lembrete_24h_enviado boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS lembrete_2h_enviado boolean NOT NULL DEFAULT false;
