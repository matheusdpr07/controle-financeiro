import "server-only";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@/generated/prisma/client";
import { createMariaDbConnectionUrl } from "@/lib/db/mariadb-connection-url";
import { getServerEnv } from "@/lib/env";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};
let prisma: PrismaClient | undefined;

export function getPrisma() {
  if (prisma) return prisma;
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const env = getServerEnv();
  const adapter = new PrismaMariaDb(
    createMariaDbConnectionUrl(env.DATABASE_URL),
  );
  prisma = new PrismaClient({ adapter });

  if (env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
  return prisma;
}
