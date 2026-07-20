import { InputHTMLAttributes, forwardRef, useId } from "react";

type CampoProps = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  erro?: string;
};

const Campo = forwardRef<HTMLInputElement, CampoProps>(function Campo(
  { rotulo, erro, id, className = "", ...props },
  ref
) {
  const idGerado = useId();
  const inputId = id ?? idGerado;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="font-titulo text-sm font-semibold text-tinta">
        {rotulo}
      </label>
      <input
        ref={ref}
        id={inputId}
        className={`rounded-md border-2 border-papel-2 bg-white px-4 py-3 text-base text-tinta outline-none transition-colors placeholder:text-tinta-suave/60 focus:border-verde ${
          erro ? "border-terracota" : ""
        } ${className}`}
        aria-invalid={erro ? true : undefined}
        {...props}
      />
      {erro && <span className="text-sm text-terracota-escuro">{erro}</span>}
    </div>
  );
});

export default Campo;
