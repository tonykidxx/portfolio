import type { Metadata } from "next";
import { Inter, Bebas_Neue, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/SessionProvider";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin", "latin-ext"],
  variable: "--font-jakarta",
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  subsets: ["latin", "latin-ext"],
  variable: "--font-bebas",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Candy Machine Studios | Portfólio Cinematográfico",
  description: "Estúdio criativo especializado em comerciais, videoclipes, documentários e produções de alto impacto visual.",
  openGraph: {
    title: "Candy Machine Studios",
    description: "Estúdio criativo especializado em produções audiovisuais de alto nível.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${plusJakarta.variable} ${bebasNeue.variable}`}>
      <body className="bg-[#141414] text-white antialiased min-h-screen font-sans">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
