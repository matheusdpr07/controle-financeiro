import { toNextJsHandler } from "better-auth/next-js";
import { getAuth } from "@/lib/auth/server";

export const runtime = "nodejs";

export const { GET, POST } = toNextJsHandler((request) =>
  getAuth().handler(request),
);
