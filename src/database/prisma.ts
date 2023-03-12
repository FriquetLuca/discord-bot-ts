import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}
const logs: ("query" | "warn" | "error")[] = ["error"];
if(process.env.NODE_ENV === "development") {
  logs.push("warn");
  if(process.env.LOG_SQL_COMMANDS) {
    logs.push("query");
  }
}

export const prisma: PrismaClient | undefined =
  global.prisma ||
  new PrismaClient({
    log: logs,
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}