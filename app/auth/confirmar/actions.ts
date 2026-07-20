"use server";

import type { EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { destinoParaTipo } from "@/lib/supabase/destino-pos-auth";
import { createClient } from "@/lib/supabase/server";

export async function confirmarAcesso(formData: FormData) {
  const tokenHash = formData.get("token_hash");
  const type = formData.get("type");

  if (typeof tokenHash !== "string" || !tokenHash || typeof type !== "string" || !type) {
    redirect("/entrar?erro=link-invalido");
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({
    type: type as EmailOtpType,
    token_hash: tokenHash,
  });

  if (error) {
    redirect("/entrar?erro=link-invalido");
  }

  redirect(destinoParaTipo(type));
}
