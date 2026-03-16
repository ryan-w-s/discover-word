import "dotenv/config"

import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaLibSql } from "@prisma/adapter-libsql"

import { PrismaClient } from "@/generated/prisma/client"

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient
}

function resolveDatabaseUrl() {
  return process.env.DATABASE_URL ?? "file:./dev.db"
}

const databaseUrl = resolveDatabaseUrl()
const isBunRuntime = "Bun" in globalThis

const adapter = isBunRuntime
  ? new PrismaLibSql({
      url: databaseUrl,
    })
  : new PrismaBetterSqlite3({
      url: databaseUrl,
    })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma
}
