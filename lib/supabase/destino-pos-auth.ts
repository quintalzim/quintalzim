/**
 * Recovery precisa sempre cair em /redefinir-senha, mesmo que um `next`
 * diferente tenha vindo na URL — senão o usuário loga e nunca troca a senha.
 */
export function destinoParaTipo(type: string | null): string {
  return type === "recovery" ? "/redefinir-senha" : "/app/inicio";
}
