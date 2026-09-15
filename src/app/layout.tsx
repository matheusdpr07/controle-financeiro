import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { ThemeBootstrap } from "@/features/theme/theme-bootstrap";
import "./globals.css";

export const metadata: Metadata = {
  title: "Controle Financeiro",
  description:
    "Organize contas, receitas, despesas e transferências para acompanhar sua vida financeira.",
};

export const viewport: Viewport = {
  colorScheme: "light dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className="h-full font-sans antialiased"
      suppressHydrationWarning
    >
      <head>
        <ThemeBootstrap />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
