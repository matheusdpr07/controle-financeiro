import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = {
  title: "Criar acesso | Controle Financeiro",
};

export default function SignUpPage() {
  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <Link
        href="/"
        className="mb-6 inline-block text-sm underline underline-offset-4"
      >
        Controle Financeiro
      </Link>
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Criar acesso</h1>
          <p className="text-muted-foreground">
            Informe seus dados para começar.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <AuthForm mode="sign-up" />
          <p className="text-sm">
            Já tem acesso?{" "}
            <Link
              href="/entrar"
              className="font-medium underline underline-offset-4"
            >
              Entrar
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
