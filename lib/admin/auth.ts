// Checagem de superadmin, centralizada. A tabela profiles já tinha uma
// coluna `role` (valores 'user' | 'admin') criada direto no Supabase —
// usamos ela em vez de uma lista de e-mails hardcoded espalhada pelo código.
export function ehSuperadmin(role: string | null | undefined): boolean {
  return role === "admin";
}
