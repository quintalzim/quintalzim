// Validação/máscara/normalização de telefone celular (WhatsApp), compartilhada
// por todos os formulários do portal que capturam esse dado. Sempre grava
// no formato 55DDNNNNNNNNN (DDI Brasil + DDD + número, só dígitos) — é o
// formato que o "Prontim - Extrator de Despesas" espera pra casar o
// remoteJid do WhatsApp com profiles.phone. NUNCA mudar esse formato de
// gravação sem atualizar o node "Extrair Telefone" no n8n junto.

// Aplica a máscara (XX) XXXXX-XXXX (ou XXXX-XXXX pra fixo) enquanto a
// pessoa digita — usar no onChange do campo, guardando o valor mascarado
// no estado (não o normalizado, que só existe no submit).
export function aplicarMascaraTelefone(valor: string): string {
  const digitos = valor.replace(/\D/g, "").slice(0, 11);
  if (digitos.length === 0) return "";
  if (digitos.length <= 2) return `(${digitos}`;
  if (digitos.length <= 6) return `(${digitos.slice(0, 2)}) ${digitos.slice(2)}`;
  if (digitos.length <= 10) {
    return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  }
  return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}`;
}

// Valida e normaliza pra 55DDNNNNNNNNN. Regras mínimas: DDD válido (11-99,
// não existe DDD começando com 0 ou 1x além do 11), 10 dígitos (fixo) ou 11
// dígitos (celular, terceiro dígito precisa ser 9). Retorna null se não bater.
export function normalizarTelefone(bruto: string): string | null {
  let digitos = bruto.replace(/\D/g, "");

  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith("55")) {
    digitos = digitos.slice(2);
  }

  if (digitos.length !== 10 && digitos.length !== 11) return null;

  const ddd = Number(digitos.slice(0, 2));
  if (ddd < 11 || ddd > 99) return null;

  if (digitos.length === 11 && digitos[2] !== "9") return null;

  return `55${digitos}`;
}

// Formata um telefone já normalizado (55DDNNNNNNNNN) pra exibição.
export function formatarTelefoneExibicao(digitos: string): string {
  const semDdi = digitos.startsWith("55") && digitos.length >= 12 ? digitos.slice(2) : digitos;
  return aplicarMascaraTelefone(semDdi);
}
