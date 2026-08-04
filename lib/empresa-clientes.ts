// Compartilhado pelos formulários públicos de /b/[slug].

export function normalizarTelefoneCliente(bruto: string): string | null {
  const digitos = bruto.replace(/\D/g, "");
  if (!digitos) return null;
  if (digitos.length === 12 || digitos.length === 13) return digitos;
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  return null;
}
