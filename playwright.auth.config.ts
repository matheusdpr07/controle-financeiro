import { defineConfig, devices } from "@playwright/test";
import { config } from "dotenv";
import { getServerEnv } from "./src/lib/env";

config({ path: ".env", quiet: true });
getServerEnv();

const baseURL = "http://127.0.0.1:3101";

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
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NODE_ENV: "development",
      BETTER_AUTH_URL: baseURL,
      NEXT_PUBLIC_APP_URL: baseURL,
    },
  },
});
