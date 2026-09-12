import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import { getServerEnv } from "./src/lib/env";

config({ path: ".env", quiet: true });
getServerEnv();

const baseURL = process.env.AUTH_E2E_BASE_URL ?? "http://127.0.0.1:3101";
const reuseExistingServer = process.env.AUTH_E2E_REUSE_SERVER === "true";

export default defineConfig({
  testDir: "./tests/auth-e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: 0,
  workers: 1,
  timeout: 90_000,
  reporter: "list",
  use: { baseURL, trace: "off" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev -- --hostname 127.0.0.1 --port 3101",
    url: `${baseURL}/entrar`,
    reuseExistingServer,
    timeout: 120_000,
    env: {
      NODE_ENV: "development",
      BETTER_AUTH_URL: baseURL,
      NEXT_PUBLIC_APP_URL: baseURL,
    },
  },
});
