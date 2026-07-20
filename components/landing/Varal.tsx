type CartaoVaral = {
  emoji: string;
  titulo: string;
  texto: string;
  rotacao: number;
};

const cartoes: CartaoVaral[] = [
  {
    emoji: "📸",
    titulo: "Foto do prato",
    texto: "Manda a foto do almoço e o Prontim conta as calorias. Mágica? Não: Quintalzim.",
    rotacao: -3,
  },
  {
    emoji: "💸",
    titulo: "Gastei 25",
    texto: "Fala o gasto no zap e pronto: anotado, somado e organizado sem abrir planilha.",
    rotacao: 2,
  },
  {
    emoji: "📅",
    titulo: "Agenda cheia",
    texto: "Seu cliente marca sozinho, você recebe o aviso e ninguém mais esquece horário.",
    rotacao: -2,
  },
  {
    emoji: "📣",
    titulo: "Post pronto",
    texto: "Todo dia uma publicação nova pro seu negócio, sem você quebrar a cabeça.",
    rotacao: 3,
  },
  {
    emoji: "☀️",
    titulo: "Bom dia útil",
    texto: "Um resumo do que importa pra você, todo dia cedinho, direto no WhatsApp.",
    rotacao: -1.5,
  },
];

function Prendedor({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 34" className={className} aria-hidden="true">
      <rect x="1.5" y="0" width="8" height="25" rx="4" fill="var(--amarelo)" />
      <rect x="14.5" y="0" width="8" height="25" rx="4" fill="var(--amarelo)" />
      <circle cx="12" cy="9" r="4.2" fill="#c98f1f" />
    </svg>
  );
}

function Cartao({ cartao, index }: { cartao: CartaoVaral; index: number }) {
  return (
    <div className="relative w-[76%] shrink-0 snap-center pt-5 sm:w-56 sm:shrink sm:snap-align-none">
      <div
        className="animate-varal-sway"
        style={{
          ["--rot" as string]: `${cartao.rotacao}deg`,
          ["--sway-delay" as string]: `${index * 0.35}s`,
        }}
      >
        <Prendedor className="absolute left-1/2 top-0 h-7 w-5 -translate-x-1/2" />
        <div className="rounded-xl bg-white p-4 text-left shadow-[var(--shadow-quintal)]">
          <p className="mb-1 text-2xl">{cartao.emoji}</p>
          <p className="font-titulo text-base font-bold text-tinta">
            {cartao.titulo}
          </p>
          <p className="mt-1 text-sm text-tinta-suave">{cartao.texto}</p>
        </div>
      </div>
    </div>
  );
}

export default function Varal() {
  return (
    <section className="relative py-10">
      <div className="relative mx-auto hidden max-w-4xl px-6 sm:block">
        <svg
          viewBox="0 0 1000 40"
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-6 top-8 h-6 w-[calc(100%-3rem)]"
          aria-hidden="true"
        >
          <path
            d="M0,8 Q500,42 1000,8"
            stroke="var(--tinta-suave)"
            strokeOpacity="0.35"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-10">
          {cartoes.map((cartao, index) => (
            <Cartao key={cartao.titulo} cartao={cartao} index={index} />
          ))}
        </div>
      </div>

      <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-pl-6 px-6 pb-2 sm:hidden">
        {cartoes.map((cartao, index) => (
          <Cartao key={cartao.titulo} cartao={cartao} index={index} />
        ))}
      </div>
    </section>
  );
}
