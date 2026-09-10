"use client";

import { createAuthClient } from "better-auth/react";
import { getClientEnv } from "@/lib/env";

function createClient() {
  return createAuthClient({ baseURL: getClientEnv().NEXT_PUBLIC_APP_URL });
}

let authClient: ReturnType<typeof createClient> | undefined;

export function getAuthClient() {
  authClient ??= createClient();
  return authClient;
}
