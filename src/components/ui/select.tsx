import * as React from "react";
import { cn } from "cn";

function Select({ className, ...props }: React.ComponentProps<"select">) {
  return (
    <select
      data-slot="select"
      className={cn(
        "h-11 w-full rounded-xl border border-input bg-white px-3 text-sm text-foreground shadow-[0_1px_2px_rgba(23,63,53,0.04)] transition-[border-color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/25 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted disabled:opacity-60 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/15",
        className,
      )}
      {...props}
    />
  );
}

export { Select };
