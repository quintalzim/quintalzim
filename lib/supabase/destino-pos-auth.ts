/**
 * Recovery precisa sempre cair em /redefinir-senha, mesmo que um `next`
 * diferente tenha vindo na URL — senão o usuário loga e nunca troca a senha.
 * `next` pode ser um caminho relativo ou uma URL absoluta (vem do
 * emailRedirectTo, repassado pelo template de e-mail via {{ .RedirectTo }}).
 */
export function destinoParaTipo(type: string | null, next?: string | null): string {
  if (type === "recovery") return "/redefinir-senha";
  return next || "/app/inicio";
}
