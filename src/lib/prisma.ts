import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

function copyFolderRecursiveSync(source: string, target: string) {
  if (!fs.existsSync(source)) return;
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const items = fs.readdirSync(source);
  for (const item of items) {
    const srcPath = path.join(source, item);
    const tgtPath = path.join(target, item);
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyFolderRecursiveSync(srcPath, tgtPath);
    } else if (!fs.existsSync(tgtPath)) {
      fs.copyFileSync(srcPath, tgtPath);
    }
  }
}

// Asegurar que el directorio de datos existe y que SQLite y uploads tienen sus archivos base
function ensureStorage() {
  try {
    // 1. SQLite en volumen persistente
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

    // 2. Uploads base (cartas, imagenesproductos) en volumen persistente
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    const defaultUploadsDir = path.join(process.cwd(), "public_uploads_default");

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    if (fs.existsSync(defaultUploadsDir)) {
      copyFolderRecursiveSync(defaultUploadsDir, uploadsDir);
    }
  } catch (error) {
    console.warn("Aviso al verificar/inicializar almacenamiento persistente:", error);
  }
}

ensureStorage();

const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
