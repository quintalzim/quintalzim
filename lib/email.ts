// Validação mínima de formato de e-mail, compartilhada pelos formulários do
// portal. Não substitui a validação real do Supabase Auth (que roda no
// signUp/signInWithOtp), mas evita mandar formulário com e-mail obviamente
// digitado errado (sem @, sem domínio, com espaço, etc.) antes de chegar lá.
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

export function emailValido(valor: string): boolean {
  return EMAIL_REGEX.test(valor.trim());
}
