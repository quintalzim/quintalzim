"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const itens: { href: string; rotulo: string; icone: ReactNode }[] = [
  {
    href: "/app/inicio",
    rotulo: "Início",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-6 w-6">
        <path
          d="M4 11.5 12 4l8 7.5M6 9.5V20h12V9.5"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/app/catalogo",
    rotulo: "Catálogo",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-6 w-6">
        <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" />
        <rect x="13" y="4" width="7" height="7" rx="1.5" stroke="currentColor" />
        <rect x="4" y="13" width="7" height="7" rx="1.5" stroke="currentColor" />
        <rect x="13" y="13" width="7" height="7" rx="1.5" stroke="currentColor" />
      </svg>
    ),
  },
  {
    href: "/app/prontim",
    rotulo: "Prontim",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-6 w-6">
        <path
          d="M4 12a8 8 0 1 1 3.2 6.4L4 20l1.3-3.6A7.96 7.96 0 0 1 4 12Z"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/app/perfil",
    rotulo: "Perfil",
    icone: (
      <svg viewBox="0 0 24 24" fill="none" strokeWidth={2} className="h-6 w-6">
        <circle cx="12" cy="8" r="3.2" stroke="currentColor" />
        <path
          d="M5 20c1.2-3.6 4-5.4 7-5.4s5.8 1.8 7 5.4"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export default function NavInferior() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t border-papel-2 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
      <ul className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {itens.map((item) => {
          const ativo = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors ${
                  ativo ? "text-terracota" : "text-tinta-suave"
                }`}
              >
                {item.icone}
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
