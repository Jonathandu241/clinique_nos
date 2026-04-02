import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clinique NOS",
  description: "Application de gestion de rendez-vous pour clinique",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
