import type { Metadata } from "next";
import LandingHeader from "@/components/landing/LandingHeader";
import Hero from "@/components/landing/Hero";
import Varal from "@/components/landing/Varal";
import ProntimSection from "@/components/landing/ProntimSection";
import PortoesSection from "@/components/landing/PortoesSection";
import ExplorarSection from "@/components/landing/ExplorarSection";
import CtaFinal from "@/components/landing/CtaFinal";
import LandingFooter from "@/components/landing/LandingFooter";

const titulo = "Quintalzim — o vizinho que resolve";
const descricao =
  "Um lugar só, com o Prontim ao seu lado, pra resolver as coisas da vida e do seu negócio.";

export const metadata: Metadata = {
  title: titulo,
  description: descricao,
  openGraph: {
    title: titulo,
    description: descricao,
    type: "website",
    locale: "pt_BR",
  },
};

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-papel">
      <LandingHeader />
      <main className="flex flex-1 flex-col">
        <Hero />
        <Varal />
        <PortoesSection />
        <ProntimSection />
        <ExplorarSection />
        <CtaFinal />
      </main>
      <LandingFooter />
    </div>
  );
}
