import type { ReactNode } from "react";
import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { ThemeToggle } from "@/features/theme/theme-toggle";

type AuthShellProps = {
  title: string;
  description: string;
  alternateText: string;
  alternateLabel: string;
  alternateHref: string;
  children: ReactNode;
};

export function AuthShell({
  title,
  description,
  alternateText,
  alternateLabel,
  alternateHref,
  children,
}: AuthShellProps) {
  return (
    <main className="grid min-h-screen bg-background text-foreground lg:grid-cols-[minmax(0,1.05fr)_minmax(30rem,0.95fr)]">
      <section className="relative hidden overflow-hidden bg-hero px-12 py-10 text-hero-foreground lg:flex lg:flex-col lg:justify-between xl:px-20 xl:py-14">
        <div aria-hidden="true" className="h-9" />
        <div className="relative z-10 max-w-xl pb-10">
          <p className="mb-5 text-sm font-semibold tracking-[0.16em] text-hero-muted uppercase">
            Sua vida financeira, com clareza
          </p>
          <h2 className="max-w-lg text-5xl leading-[1.05] font-semibold tracking-[-0.055em] xl:text-6xl">
            Organize hoje. Decida melhor amanhã.
          </h2>
          <p className="mt-6 max-w-md text-lg leading-8 text-hero-muted">
            Um espaço privado para acompanhar contas, categorias e lançamentos
            sem transformar sua rotina em planilhas complicadas.
          </p>
        </div>
        <div
          aria-hidden="true"
          className="absolute -right-28 -bottom-44 size-[32rem] rounded-full border-[6rem] border-hero-accent opacity-70"
        />
      </section>

      <section className="flex min-h-screen flex-col bg-surface px-5 py-6 sm:px-10 lg:px-16 lg:py-10 xl:px-24">
        <div className="flex items-center justify-between gap-4">
          <BrandMark />
          <ThemeToggle />
        </div>
        <div className="my-auto w-full max-w-md self-center py-12">
          <p className="text-sm font-semibold text-primary">Área segura</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-4 max-w-sm text-[15px] leading-6 text-muted-foreground">
            {description}
          </p>
          <div className="mt-9">{children}</div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            {alternateText}{" "}
            <Link
              href={alternateHref}
              className="font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded-sm focus-visible:ring-3 focus-visible:ring-ring/40 focus-visible:outline-none"
            >
              {alternateLabel}
            </Link>
          </p>
        </div>
        <p className="text-center text-xs leading-5 text-muted-foreground">
          Seus dados são usados somente para organizar suas próprias finanças.
        </p>
      </section>
    </main>
  );
}
