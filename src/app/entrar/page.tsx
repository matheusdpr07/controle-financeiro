import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = { title: "Entrar | Controle Financeiro" };

export default function SignInPage() {
  return (
    <AuthShell
      title="Entrar"
      description="Acesse com seu e-mail e sua senha para continuar de onde parou."
      alternateText="Ainda não tem acesso?"
      alternateLabel="Criar acesso"
      alternateHref="/cadastro"
    >
      <AuthForm mode="sign-in" />
    </AuthShell>
  );
}
