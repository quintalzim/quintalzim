import { AuthError } from "@supabase/supabase-js";

const mensagensPorCodigo: Record<string, string> = {
  invalid_credentials: "E-mail ou senha não bateram. Tenta de novo?",
  email_not_confirmed:
    "Seu e-mail ainda não foi confirmado. Dá uma olhada na caixa de entrada (e no spam) pra achar o link.",
  user_already_exists: "Esse e-mail já tem portão aqui. Quer entrar?",
  email_exists: "Esse e-mail já tem portão aqui. Quer entrar?",
  weak_password: "Sua senha precisa de pelo menos 8 caracteres.",
  over_email_send_rate_limit:
    "Calma lá, muitos pedidos seguidos. Espera um minutinho e tenta de novo.",
  over_request_rate_limit:
    "Calma lá, muitos pedidos seguidos. Espera um minutinho e tenta de novo.",
  same_password: "Essa já é sua senha atual. Escolhe uma diferente pra trocar.",
};

export function mensagemErroAuth(error: AuthError | Error | null | undefined): string {
  if (!error) return "";

  const codigo = "code" in error ? error.code : undefined;
  if (codigo && mensagensPorCodigo[codigo]) {
    return mensagensPorCodigo[codigo];
  }

  return "Algo não saiu como esperado. Tenta de novo daqui a pouco?";
}
