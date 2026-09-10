import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AuthForm } from "@/features/auth/auth-form";

export const metadata: Metadata = { title: "Entrar | Controle Financeiro" };

export default function SignInPage() {
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
          <h1 className="text-2xl font-semibold">Entrar</h1>
          <p className="text-muted-foreground">
            Acesse com seu e-mail e sua senha.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <AuthForm mode="sign-in" />
          <p className="text-sm">
            Ainda não tem acesso?{" "}
            <Link
              href="/cadastro"
              className="font-medium underline underline-offset-4"
            >
              Criar acesso
            </Link>
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
