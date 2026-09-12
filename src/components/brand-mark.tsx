import Link from "next/link";
import { cn } from "cn";

export function BrandMark({ inverse = false }: { inverse?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Controle Financeiro — início"
      className={cn(
        "inline-flex items-center gap-3 rounded-xl transition-opacity outline-none hover:opacity-80 focus-visible:ring-3 focus-visible:ring-[#74a995]/40",
        inverse ? "text-white" : "text-[#173f35]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "grid size-9 place-items-center rounded-xl text-[13px] font-bold tracking-[-0.02em] shadow-sm",
          inverse ? "bg-white text-[#173f35]" : "bg-[#173f35] text-white",
        )}
      >
        CF
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.02em]">
        Controle Financeiro
      </span>
    </Link>
  );
}
