import { NextResponse, type NextRequest } from "next/server";
import { destinoParaTipo } from "@/lib/supabase/destino-pos-auth";
import { createClient } from "@/lib/supabase/server";

// `next` pode vir como caminho relativo (/app/inicio) ou URL absoluta
// (quando repassado por {{ .RedirectTo }} do template de e-mail).
function resolverDestino(origin: string, destino: string) {
  return destino.startsWith("http") ? destino : `${origin}${destino}`;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(resolverDestino(origin, destinoParaTipo(type, next)));
    }

    const url = new URL("/entrar", origin);
    url.searchParams.set("erro", "link-invalido");
    return NextResponse.redirect(url);
  }

  if (tokenHash && type) {
    // Não verifica na hora: um scanner de e-mail que pré-carrega este link
    // não clica em botão, então o token continua válido até o clique real.
    const url = new URL("/auth/confirmar", origin);
    url.searchParams.set("token_hash", tokenHash);
    url.searchParams.set("type", type);
    if (next) url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  const url = new URL("/entrar", origin);
  url.searchParams.set("erro", "link-invalido");
  return NextResponse.redirect(url);
}
