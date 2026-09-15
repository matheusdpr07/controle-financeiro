import type { Metadata } from "next";
import { PrivateShell } from "@/components/private-shell";
import { SubmitButton } from "@/components/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CategoryForm } from "@/features/categories/category-form";
import { setCategoryArchivedAction } from "@/features/categories/actions";
import { listCategories, type CategoryDTO } from "@/features/categories/data";
import { categoryKindLabels } from "@/features/categories/schemas";

export const metadata: Metadata = {
  title: "Categorias | Controle Financeiro",
};

function CategoryItem({ category }: { category: CategoryDTO }) {
  const isIncome = category.kind === "INCOME";
  return (
    <li className="rounded-3xl bg-surface-raised p-5 shadow-[0_10px_30px_var(--shadow-soft)] ring-1 ring-border sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className={
              isIncome
                ? "size-3 rounded-full bg-income"
                : "size-3 rounded-full bg-expense"
            }
          />
          <div>
            <p className="font-semibold text-foreground">{category.name}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {categoryKindLabels[category.kind]}
            </p>
          </div>
        </div>
        <form action={setCategoryArchivedAction}>
          <input type="hidden" name="id" value={category.id} />
          <input
            type="hidden"
            name="archived"
            value={category.archived ? "false" : "true"}
          />
          <SubmitButton
            label={category.archived ? "Restaurar" : "Arquivar"}
            pendingLabel="Aguarde…"
            variant="outline"
          />
        </form>
      </div>
      {!category.archived && (
        <details className="mt-5 border-t border-border pt-4">
          <summary className="w-fit cursor-pointer list-none rounded-lg px-2 py-1 text-sm font-semibold text-primary outline-none hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/35">
            Editar
          </summary>
          <div className="mt-5 rounded-2xl bg-surface p-4 ring-1 ring-border/70 sm:p-5">
            <CategoryForm category={category} />
          </div>
        </details>
      )}
    </li>
  );
}

export default async function CategoriesPage() {
  const categories = await listCategories();
  const active = categories.filter((category) => !category.archived);
  const archived = categories.filter((category) => category.archived);

  return (
    <PrivateShell current="categorias">
      <div className="space-y-10">
        <header className="max-w-3xl">
          <p className="text-sm font-semibold text-primary">Classificação</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl">
            Categorias
          </h1>
          <p className="mt-4 text-base leading-7 text-muted-foreground">
            Classifique receitas e despesas com nomes próprios.
          </p>
        </header>

        <div className="grid items-start gap-8 lg:grid-cols-[minmax(20rem,0.9fr)_minmax(0,1.35fr)]">
          <Card className="lg:sticky lg:top-32">
            <CardHeader>
              <CardTitle>Nova categoria</CardTitle>
              <CardDescription>
                A mesma descrição pode existir uma vez em cada natureza.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryForm />
            </CardContent>
          </Card>

          <div className="space-y-10">
            <section aria-labelledby="active-categories-title">
              <div className="flex items-end justify-between gap-4">
                <h2
                  id="active-categories-title"
                  className="text-2xl font-semibold tracking-[-0.03em] text-foreground"
                >
                  Categorias ativas
                </h2>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary ring-1 ring-primary/15">
                  {active.length}
                </span>
              </div>
              {active.length ? (
                <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                  {active.map((category) => (
                    <CategoryItem key={category.id} category={category} />
                  ))}
                </ul>
              ) : (
                <p className="mt-5 rounded-3xl border border-dashed border-border bg-surface/60 px-6 py-10 text-center text-sm text-muted-foreground">
                  Nenhuma categoria ativa.
                </p>
              )}
            </section>

            {archived.length > 0 && (
              <section aria-labelledby="archived-categories-title">
                <h2
                  id="archived-categories-title"
                  className="text-2xl font-semibold tracking-[-0.03em] text-muted-foreground"
                >
                  Categorias arquivadas
                </h2>
                <ul className="mt-5 grid gap-4 opacity-80 sm:grid-cols-2">
                  {archived.map((category) => (
                    <CategoryItem key={category.id} category={category} />
                  ))}
                </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    </PrivateShell>
  );
}
