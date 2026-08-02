-- Corrige o telefone vinculado ao seu perfil (rode no SQL Editor do Supabase)

UPDATE public.profiles
SET phone = '5511989405071'
WHERE id = 'a95ce74f-efed-49e6-9eb0-27b250d3d799';

-- Confirma o valor salvo:
SELECT id, phone FROM public.profiles WHERE id = 'a95ce74f-efed-49e6-9eb0-27b250d3d799';
