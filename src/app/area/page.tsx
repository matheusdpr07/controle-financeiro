import type { Metadata } from "next";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SignOutButton } from "@/features/auth/sign-out-button";
import { requireUser } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Meu acesso | Controle Financeiro" };

export default async function AccountPage() {
  const user = await requireUser();
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-semibold">Meu acesso</h1>
        </CardHeader>
        <CardContent className="space-y-6">
          <p>Olá, {user.name}.</p>
          <dl className="space-y-1">
            <dt className="text-sm text-muted-foreground">E-mail</dt>
            <dd>{user.email}</dd>
          </dl>
          <p className="text-muted-foreground">
            As funcionalidades financeiras serão disponibilizadas nas próximas
            etapas.
          </p>
          <SignOutButton />
        </CardContent>
      </Card>
    </main>
  );
}
