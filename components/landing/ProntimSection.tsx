type Mensagem = {
  autor: "voce" | "prontim";
  texto: string;
};

const mensagens: Mensagem[] = [
  { autor: "voce", texto: "Prontim, marca o João no corte de sábado às 10h" },
  {
    autor: "prontim",
    texto:
      "Marcado: João, corte, sábado às 10h. Já mandei o lembrete pra ele não esquecer. Prontim ✅",
  },
  { autor: "voce", texto: "e quanto vendi essa semana?" },
  {
    autor: "prontim",
    texto: "R$ 1.240 até agora — R$ 180 a mais que semana passada. Tá bonito o quintal! 🌱",
  },
];

function Balao({ mensagem }: { mensagem: Mensagem }) {
  const deVoce = mensagem.autor === "voce";
  return (
    <div className={`flex ${deVoce ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm shadow-[var(--shadow-quintal-sm)] ${
          deVoce
            ? "rounded-tr-sm bg-verde text-papel"
            : "rounded-tl-sm bg-white text-tinta"
        }`}
      >
        {mensagem.texto}
      </div>
    </div>
  );
}

export default function ProntimSection() {
  return (
    <section className="px-6 py-14">
      <div className="mx-auto grid max-w-4xl gap-10 sm:grid-cols-2 sm:items-center sm:gap-12">
        <div className="flex flex-col gap-4 text-center sm:text-left">
          <h2 className="font-titulo text-2xl font-extrabold text-tinta sm:text-3xl">
            Esse é o Prontim, o vizinho que resolve.
          </h2>
          <p className="text-base text-tinta-suave">
            O Prontim é quem vai te atender no Quintalzim. Você fala do seu
            jeito — texto ou áudio — e ele entende, resolve e confirma.
          </p>
          <p className="text-base text-tinta-suave">
            Ele não usa palavra difícil, não te deixa no vácuo e não pede pra
            abrir um chamado. Ele só... resolve.
          </p>
        </div>

        <div className="rounded-2xl bg-papel-2 p-4 shadow-[var(--shadow-quintal)] sm:p-5">
          <div className="mb-3 flex items-center gap-2 border-b border-white/60 pb-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-verde text-lg">
              🌱
            </span>
            <div>
              <p className="font-titulo text-sm font-bold text-tinta">Prontim</p>
              <p className="text-xs text-tinta-suave">online</p>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {mensagens.map((mensagem, index) => (
              <Balao key={index} mensagem={mensagem} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
