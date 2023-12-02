import { PrismaClient } from "@prisma/client"

declare global {
  var prisma: PrismaClient | undefined
}
const logs: ("query" | "warn" | "error")[] = ["error"]
if(process.env.NODE_ENV === "development") {
  logs.push("warn")
  logs.push("query")
}

export const prisma: PrismaClient | undefined =
  global.prisma ||
  new PrismaClient({
    log: logs,
  })

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma
}
