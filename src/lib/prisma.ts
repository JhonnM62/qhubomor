import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

// Asegurar que el directorio de datos existe y que SQLite tiene su base inicial
function ensureDatabaseFile() {
  try {
    const dataDir = path.join(process.cwd(), "prisma", "data");
    const dbPath = path.join(dataDir, "data.sqlite");
    const templateDbPath = path.join(process.cwd(), "prisma", "data.sqlite");

    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    if (!fs.existsSync(dbPath) && fs.existsSync(templateDbPath)) {
      console.log("Inicializando base de datos SQLite en volumen persistente...");
      fs.copyFileSync(templateDbPath, dbPath);
    }
  } catch (error) {
    console.warn("Aviso al verificar/inicializar SQLite:", error);
  }
}

ensureDatabaseFile();

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
