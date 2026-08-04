import Link from "next/link";
import QuizSaudeFitness from "@/components/public/QuizSaudeFitness";
import { quizSaudeFitness } from "@/lib/quiz/saude-fitness";

export default function QuizSaudeFitnessPage() {
  return (
    <div className="flex flex-1 flex-col items-center bg-papel px-6 py-16">
      <div className="flex w-full max-w-sm flex-col items-center gap-1 pb-6 text-center">
        <Link href="/" className="font-titulo text-sm font-semibold text-verde-escuro">
          Quintalzim
        </Link>
        <p className="text-xs text-tinta-suave">{quizSaudeFitness.subtitulo}</p>
      </div>
      <QuizSaudeFitness />
    </div>
  );
}
