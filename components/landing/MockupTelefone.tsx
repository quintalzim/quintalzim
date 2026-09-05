import { ReactNode } from "react";

export default function MockupTelefone({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-[260px] shrink-0 sm:w-[280px] ${className}`}>
      <div className="rounded-[2.2rem] border-[6px] border-tinta bg-tinta p-1.5 shadow-[var(--shadow-quintal)]">
        <div className="relative h-[520px] overflow-hidden rounded-[1.6rem] bg-papel">
          <div className="absolute left-1/2 top-1.5 z-10 h-4 w-20 -translate-x-1/2 rounded-full bg-tinta" />
          <div className="h-full overflow-hidden pt-6 text-left">{children}</div>
        </div>
      </div>
    </div>
  );
}
