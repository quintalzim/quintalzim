-- Promove admin@quintalzim.com.br a superadmin (mesmo nível do fundador,
-- que já tem profiles.role = 'admin') e cadastra os 3 planos como já ativos
-- (cosmético/à prova de futuro — hoje nenhuma tela é bloqueada por plano,
-- mas assim o Perfil/Empresa/Marketplace já mostram "ativa" em vez do CTA
-- de assinar). Rode este script UMA VEZ no Supabase: Dashboard → SQL Editor.

UPDATE public.profiles
SET role = 'admin'
WHERE id = '62dbd3cb-cc89-4d21-a888-25232426c919'; -- admin@quintalzim.com.br

INSERT INTO public.assinaturas (profile_id, plano, categoria, status)
VALUES
  ('62dbd3cb-cc89-4d21-a888-25232426c919', 'pf_premium', 'pf', 'ativa'),
  ('62dbd3cb-cc89-4d21-a888-25232426c919', 'empresa_completo', 'empresa', 'ativa'),
  ('62dbd3cb-cc89-4d21-a888-25232426c919', 'profissional', 'profissional', 'ativa')
ON CONFLICT (profile_id, categoria) DO UPDATE
SET plano = EXCLUDED.plano, status = 'ativa';
