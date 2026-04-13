/// Layout racine de Clinique NOS — applique les polices globales et les métadonnées SEO.

import type { Metadata } from "next";
import { Figtree, Noto_Sans } from "next/font/google";
import "./globals.css";

/// Police de titre : Figtree — moderne, médicale, lisible.
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-figtree",
  display: "swap",
});

/// Police de corps : Noto Sans — excellente accessibilité, neutre.
const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Clinique NOS — Soins de qualité, à votre portée",
  description:
    "Prenez rendez-vous en ligne avec nos médecins spécialistes. Clinique NOS vous offre un suivi personnalisé, des consultations rapides et un espace patient sécurisé.",
  keywords: ["clinique", "rendez-vous médecin", "consultation", "santé", "spécialiste"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${figtree.variable} ${notoSans.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
