import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export default function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl bg-white/70 p-5 shadow-[var(--shadow-quintal)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
