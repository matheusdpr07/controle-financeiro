import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const nodeTests = [
  "tests/integration/auth-http.test.ts",
  "tests/integration/prisma-config.test.ts",
  "tests/unit/auth-session.test.ts",
  "tests/unit/entry-ownership.test.ts",
  "tests/unit/env.test.ts",
  "tests/unit/financial-ownership.test.ts",
];

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    projects: [
      {
        extends: true,
        test: {
          name: "node",
          environment: "node",
          include: nodeTests,
        },
      },
      {
        extends: true,
        test: {
          name: "dom",
          environment: "jsdom",
          include: [
            "tests/unit/**/*.test.{ts,tsx}",
            "tests/integration/**/*.test.{ts,tsx}",
          ],
          exclude: nodeTests,
        },
      },
    ],
    setupFiles: ["./tests/setup.ts"],
  },
});
