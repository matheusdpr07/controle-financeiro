"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAuthClient } from "@/lib/auth/client";

export function AuthForm({ mode }: { mode: "sign-in" | "sign-up" }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const isSignUp = mode === "sign-up";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError("");
    try {
      const credentials = {
        email: String(data.get("email") ?? "")
          .trim()
          .toLowerCase(),
        password: String(data.get("password") ?? ""),
      };
      const client = getAuthClient();
      const result = isSignUp
        ? await client.signUp.email({
            ...credentials,
            name: String(data.get("name") ?? "").trim(),
          })
        : await client.signIn.email(credentials);
      if (result.error) {
        if (result.error.status === 429) {
          setError("Muitas tentativas. Aguarde um pouco e tente novamente.");
        } else if (result.error.code === "INVALID_AUTH_INPUT") {
          setError(result.error.message ?? "Confira os dados informados.");
        } else if (isSignUp) {
          setError(
            "Não foi possível criar seu acesso. Confira os dados ou tente entrar.",
          );
        } else {
          setError("Não foi possível entrar. Confira seu e-mail e sua senha.");
        }
        return;
      }
      router.replace("/area");
      router.refresh();
    } catch {
      setError("Não foi possível conectar. Tente novamente em instantes.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5" aria-busy={pending}>
      {isSignUp && (
        <div className="space-y-2">
          <Label htmlFor="name">Nome</Label>
          <Input
            id="name"
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={100}
            disabled={pending}
          />
        </div>
      )}
      <div className="space-y-2">
        <Label htmlFor="email">E-mail</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          disabled={pending}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete={isSignUp ? "new-password" : "current-password"}
          required
          minLength={isSignUp ? 12 : 1}
          maxLength={128}
          aria-describedby={isSignUp ? "password-hint" : undefined}
          disabled={pending}
        />
        {isSignUp && (
          <p id="password-hint" className="text-sm text-muted-foreground">
            Use entre 12 e 128 caracteres.
          </p>
        )}
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 px-4 py-3 text-sm leading-5 text-destructive"
        >
          {error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Aguarde…" : isSignUp ? "Criar acesso" : "Entrar"}
      </Button>
    </form>
  );
}
