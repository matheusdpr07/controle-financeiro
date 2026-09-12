import { createRequire } from "node:module";
import { resolve } from "node:path";
import { expect, test } from "vitest";
import { loadConfigFromFile } from "@prisma/config";

const requireFromTest = createRequire(import.meta.url);
const requireFromConfig = createRequire(
  requireFromTest.resolve("@prisma/config"),
);
const { deepmerge } = requireFromConfig(
  "deepmerge-ts",
) as typeof import("deepmerge-ts");

test("carrega a configuração real do Prisma com o merger corrigido, sem banco", async () => {
  const result = await loadConfigFromFile({ configRoot: process.cwd() });
  expect(result.error).toBeUndefined();
  expect(result.config?.schema).toBe(resolve("prisma/schema.prisma"));
  expect(result.config?.migrations?.path).toBe(resolve("prisma/migrations"));
});

test("mantém os campos e a precedência ao mesclar configurações Prisma", () => {
  const first = {
    schema: "old.prisma",
    migrations: { path: "prisma/migrations" },
    datasource: { url: "" },
  };
  const second = {
    schema: "prisma/schema.prisma",
    migrations: { seed: "node seed.mjs" },
  };
  expect(deepmerge(undefined, first, second, undefined)).toEqual({
    schema: "prisma/schema.prisma",
    migrations: { path: "prisma/migrations", seed: "node seed.mjs" },
    datasource: { url: "" },
  });
  expect(first.schema).toBe("old.prisma");
  expect(first.migrations).toEqual({ path: "prisma/migrations" });
});

test("não estoura a pilha ao mesclar referências circulares (GHSA-ggr8-5vv4-36mx)", () => {
  type Recursive = { self?: Recursive };
  const left: Recursive = {};
  const right: Recursive = {};
  left.self = left;
  right.self = right;
  const result = deepmerge(left, right);
  expect(result.self).toBe(result);
});
