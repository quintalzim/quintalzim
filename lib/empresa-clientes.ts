// Compartilhado entre o formulário público (/b/[slug]) e o finalizador de
// cadastro (rodado depois que o cliente final confirma o magic link).

export const CHAVE_CADASTRO_PENDENTE = "quintalzim_cadastro_pendente_empresa";

export type CadastroPendente = {
  empresaId: string;
  nome: string;
  telefone: string;
};

export function normalizarTelefoneCliente(bruto: string): string | null {
  const digitos = bruto.replace(/\D/g, "");
  if (!digitos) return null;
  if (digitos.length === 12 || digitos.length === 13) return digitos;
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  return null;
}
