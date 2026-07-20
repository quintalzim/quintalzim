import type { Metadata, Viewport } from "next";
import { Baloo_2, Nunito } from "next/font/google";
import "./globals.css";

const baloo = Baloo_2({
  variable: "--font-baloo",
  subsets: ["latin"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quintalzim",
  description: "O portal por assinatura da sua cidade, do jeito do interior.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Quintalzim",
  },
};

export const viewport: Viewport = {
  themeColor: "#3F6B34",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${baloo.variable} ${nunito.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-papel text-tinta antialiased">
        {children}
      </body>
    </html>
  );
}
