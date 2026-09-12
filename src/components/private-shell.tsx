import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { cn } from "cn";

type PrivateSection = "area" | "contas" | "categorias" | "lancamentos";

const navigation = [
  { key: "area", label: "Início", href: "/area" },
  { key: "contas", label: "Contas", href: "/contas" },
  { key: "categorias", label: "Categorias", href: "/categorias" },
  { key: "lancamentos", label: "Lançamentos", href: "/lancamentos" },
] as const;

export function PrivateShell({
  current,
  children,
}: {
  current: PrivateSection;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f6f2] text-[#1d2a26]">
      <a
        href="#conteudo"
        className="fixed top-3 left-3 z-50 -translate-y-20 rounded-xl bg-[#173f35] px-4 py-2 text-sm font-semibold text-white transition-transform focus:translate-y-0"
      >
        Ir para o conteúdo
      </a>
      <header className="sticky top-0 z-40 border-b border-[#dfe4df]/90 bg-[#f5f6f2]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:flex-nowrap lg:px-8">
          <BrandMark />
          <nav
            aria-label="Navegação principal"
            className="order-3 flex w-full items-center gap-1 overflow-x-auto rounded-2xl bg-white/70 p-1 shadow-[0_1px_0_rgba(23,63,53,0.06)] lg:order-2 lg:w-auto"
          >
            {navigation.map((item) => {
              const active = item.key === current;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex-1 rounded-xl px-3 py-2 text-center text-[13px] font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-3 focus-visible:ring-[#74a995]/40 sm:px-4",
                    active
                      ? "bg-[#173f35] text-white shadow-sm"
                      : "text-[#617069] hover:bg-[#edf1ed] hover:text-[#173f35]",
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="order-2 lg:order-3">
            <SignOutButton />
          </div>
        </div>
      </header>
      <main
        id="conteudo"
        className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8"
      >
        {children}
      </main>
      <footer className="mx-auto max-w-7xl px-4 pb-10 text-center text-xs text-[#77817c] sm:px-6 lg:px-8">
        Controle Financeiro · organização pessoal com privacidade
      </footer>
    </div>
  );
}
