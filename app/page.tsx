import type { Metadata } from "next";
import LandingHeader from "@/components/landing/LandingHeader";
import Hero from "@/components/landing/Hero";
import Varal from "@/components/landing/Varal";
import CapturaEmail from "@/components/landing/CapturaEmail";
import ProntimSection from "@/components/landing/ProntimSection";
import PortoesSection from "@/components/landing/PortoesSection";
import LandingFooter from "@/components/landing/LandingFooter";

const titulo = "Quintalzim — Vem aí";
const descricao =
  "Um lugar só, no seu WhatsApp, pra resolver as coisas da vida e do seu negócio.";

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
        <CapturaEmail />
        <ProntimSection />
        <PortoesSection />
      </main>
      <LandingFooter />
    </div>
  );
}
