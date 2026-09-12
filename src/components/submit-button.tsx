"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";

export function SubmitButton({
  label,
  pendingLabel,
  variant = "default",
  className,
}: {
  label: string;
  pendingLabel: string;
  variant?: "default" | "outline";
  className?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant={variant}
      className={className}
      disabled={pending}
    >
      {pending ? pendingLabel : label}
    </Button>
  );
}
