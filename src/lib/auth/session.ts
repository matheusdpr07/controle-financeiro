import "server-only";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAuth } from "@/lib/auth/server";

export async function requireUser() {
  const requestHeaders = await headers();
  const session = await getAuth().api.getSession({ headers: requestHeaders });
  if (!session) redirect("/entrar");
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  };
}
