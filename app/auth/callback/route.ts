import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const next = searchParams.get("next") ?? "/app/inicio";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
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
    return NextResponse.redirect(url);
  }

  const url = new URL("/entrar", origin);
  url.searchParams.set("erro", "link-invalido");
  return NextResponse.redirect(url);
}
