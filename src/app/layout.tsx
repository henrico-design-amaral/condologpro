import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CondoLogPro",
  description: "Gestão local-first de encomendas condominiais."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
