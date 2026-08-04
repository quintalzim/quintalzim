// Motor genérico de Quiz-Funil (seção 3 do doc de contexto): perguntas em JSON,
// pensado pra ser replicável (quiz saúde/fitness hoje; finanças, diagnóstico do
// negócio depois, mesmo formato).

export type OpcaoQuiz = {
  valor: string;
  rotulo: string;
};

export type PerguntaQuiz = {
  id: string;
  pergunta: string;
  opcoes: OpcaoQuiz[];
};

export type ConfigQuiz = {
  id: string;
  titulo: string;
  subtitulo: string;
  perguntas: PerguntaQuiz[];
};
