"use client";

import { InputHTMLAttributes, forwardRef, useId, useState } from "react";

type CampoSenhaProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  rotulo: string;
  erro?: string;
};

const CampoSenha = forwardRef<HTMLInputElement, CampoSenhaProps>(function CampoSenha(
  { rotulo, erro, id, className = "", ...props },
  ref
) {
  const [visivel, setVisivel] = useState(false);
  const idGerado = useId();
  const inputId = id ?? idGerado;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="font-titulo text-sm font-semibold text-tinta">
        {rotulo}
      </label>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          type={visivel ? "text" : "password"}
          className={`w-full rounded-md border-2 border-papel-2 bg-white px-4 py-3 pr-12 text-base text-tinta outline-none transition-colors placeholder:text-tinta-suave/60 focus:border-verde ${
            erro ? "border-terracota" : ""
          } ${className}`}
          aria-invalid={erro ? true : undefined}
          {...props}
        />
        <button
          type="button"
          onClick={() => setVisivel((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-tinta-suave outline-none transition-colors hover:text-tinta focus-visible:text-verde-escuro"
          aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        >
          {visivel ? (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-5 w-5">
              <path
                d="M3 3l18 18M10.6 10.7a2.5 2.5 0 0 0 3.5 3.5M7.4 7.5C5.1 9 3.5 11 3 12c1.4 2.8 5 7 9 7 1.6 0 3.1-.4 4.4-1.1M14.5 5.2c-.8-.2-1.6-.3-2.5-.3-4 0-7.6 4.2-9 7 .4.8 1.2 2.1 2.3 3.4"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-5 w-5">
              <path
                d="M3 12c1.4-2.8 5-7 9-7s7.6 4.2 9 7c-1.4 2.8-5 7-9 7s-7.6-4.2-9-7Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="2.5" stroke="currentColor" />
            </svg>
          )}
        </button>
      </div>
      {erro && <span className="text-sm text-terracota-escuro">{erro}</span>}
    </div>
  );
});

export default CampoSenha;
