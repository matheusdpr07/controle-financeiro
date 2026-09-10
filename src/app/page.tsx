import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 items-center px-6 py-16">
      <Card className="w-full">
        <CardHeader>
          <h1 className="text-2xl font-semibold tracking-tight">
            Controle Financeiro
          </h1>
        </CardHeader>
        <CardContent className="space-y-3 text-base">
          <p>A fundação do projeto está configurada.</p>
          <p className="text-muted-foreground">
            As funcionalidades financeiras serão construídas nas próximas
            etapas.
          </p>
          <nav aria-label="Acesso" className="flex gap-5 pt-2">
            <Link
              href="/entrar"
              className="font-medium underline underline-offset-4"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="font-medium underline underline-offset-4"
            >
              Criar acesso
            </Link>
          </nav>
        </CardContent>
      </Card>
    </main>
  );
}
