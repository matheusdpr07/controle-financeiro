import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = {
  title: "Criar acesso | Controle Financeiro",
};

export default function SignUpPage() {
  return (
    <AuthShell
      title="Criar acesso"
      description="Informe seus dados para começar a organizar suas finanças pessoais."
      alternateText="Já tem acesso?"
      alternateLabel="Entrar"
      alternateHref="/entrar"
    >
      <AuthForm mode="sign-up" />
    </AuthShell>
  );
}
