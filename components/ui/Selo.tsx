import { HTMLAttributes } from "react";

type SeloProps = HTMLAttributes<HTMLSpanElement> & {
  variante?: "verde" | "terracota" | "amarelo";
};

const variantes = {
  verde: "bg-verde/10 text-verde-escuro",
  terracota: "bg-terracota/10 text-terracota-escuro",
  amarelo: "bg-amarelo/20 text-[#7a5417]",
};

export default function Selo({
  variante = "verde",
  className = "",
  children,
  ...props
}: SeloProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${variantes[variante]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
