import { ConfigQuiz } from "./tipos";

export const quizSaudeFitness: ConfigQuiz = {
  id: "saude-fitness",
  titulo: "Diagnóstico rápido de hábitos",
  subtitulo: "6 perguntas. No fim, o Prontim monta um diagnóstico só teu.",
  perguntas: [
    {
      id: "objetivo",
      pergunta: "Qual é o teu principal objetivo agora?",
      opcoes: [
        { valor: "emagrecer", rotulo: "Emagrecer com saúde" },
        { valor: "disposicao", rotulo: "Ter mais disposição no dia a dia" },
        { valor: "comer_melhor", rotulo: "Comer melhor, sem radicalismo" },
        { valor: "dormir_melhor", rotulo: "Dormir melhor" },
        { valor: "ansiedade", rotulo: "Reduzir estresse e ansiedade" },
      ],
    },
    {
      id: "atividade",
      pergunta: "Como está tua rotina de atividade física hoje?",
      opcoes: [
        { valor: "sedentario", rotulo: "Bem parado, quase não me mexo" },
        { valor: "as_vezes", rotulo: "Me mexo de vez em quando" },
        { valor: "irregular", rotulo: "Sou ativo, mas de forma irregular" },
        { valor: "constante", rotulo: "Ativo e constante" },
      ],
    },
    {
      id: "obstaculo",
      pergunta: "Qual é o maior obstáculo hoje?",
      opcoes: [
        { valor: "tempo", rotulo: "Falta de tempo" },
        { valor: "motivacao", rotulo: "Falta de motivação" },
        { valor: "nao_sei_comecar", rotulo: "Não sei por onde começar" },
        { valor: "ja_tentei", rotulo: "Já tentei de tudo e nada gruda" },
        { valor: "acesso", rotulo: "Dinheiro ou acesso a boas opções" },
      ],
    },
    {
      id: "alimentacao_fora",
      pergunta: "Quantas vezes por semana você come fora de casa ou pede comida?",
      opcoes: [
        { valor: "quase_nunca", rotulo: "Quase nunca" },
        { valor: "1_2x", rotulo: "1 a 2 vezes" },
        { valor: "3_5x", rotulo: "3 a 5 vezes" },
        { valor: "quase_todo_dia", rotulo: "Quase todo dia" },
      ],
    },
    {
      id: "sono",
      pergunta: "Como anda o teu sono?",
      opcoes: [
        { valor: "bem", rotulo: "Durmo bem" },
        { valor: "pouco", rotulo: "Durmo pouco" },
        { valor: "mal", rotulo: "Durmo mal ou irregular" },
        { valor: "nao_sei", rotulo: "Não sei dizer direito" },
      ],
    },
    {
      id: "mudanca_prioritaria",
      pergunta: "Se pudesse mudar uma coisa a partir de amanhã, qual seria?",
      opcoes: [
        { valor: "comer_melhor", rotulo: "Comer melhor" },
        { valor: "me_mexer", rotulo: "Me mexer mais" },
        { valor: "dormir_melhor", rotulo: "Dormir melhor" },
        { valor: "menos_ansiedade", rotulo: "Ter menos ansiedade no dia a dia" },
      ],
    },
  ],
};
