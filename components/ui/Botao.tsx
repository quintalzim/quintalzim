import { ButtonHTMLAttributes, forwardRef } from "react";

type BotaoProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primario" | "secundario";
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 font-titulo font-semibold text-base transition-all duration-150 active:translate-y-[3px] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:translate-y-0";

const variantes = {
  primario:
    "bg-terracota text-papel shadow-[0_4px_0_0_var(--terracota-escuro)] hover:bg-[color-mix(in_srgb,var(--terracota)_92%,white)] active:shadow-[0_1px_0_0_var(--terracota-escuro)] disabled:active:shadow-[0_4px_0_0_var(--terracota-escuro)]",
  secundario:
    "bg-transparent text-verde-escuro border-2 border-verde shadow-[0_4px_0_0_var(--verde)] hover:bg-[color-mix(in_srgb,var(--verde)_8%,transparent)] active:shadow-[0_1px_0_0_var(--verde)] disabled:active:shadow-[0_4px_0_0_var(--verde)]",
};

const Botao = forwardRef<HTMLButtonElement, BotaoProps>(function Botao(
  { variante = "primario", className = "", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`${base} ${variantes[variante]} ${className}`}
      {...props}
    />
  );
});

export default Botao;
