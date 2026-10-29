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

// Ruta canónica absoluta en el volumen persistente
const cwd = process.cwd();
const persistentDir = path.join(cwd, "prisma", "data");
const persistentDbPath = path.join(persistentDir, "data.sqlite");

// Asegurar que el directorio de datos existe y que SQLite y uploads tienen sus archivos base
function ensureStorage() {
  try {
    // 1. SQLite en volumen persistente
    const templateDbPath = path.join(cwd, "prisma", "data.sqlite");
    const rootDataDir = path.join(cwd, "data");
    const rootDbPath = path.join(rootDataDir, "data.sqlite");

    if (!fs.existsSync(persistentDir)) {
      fs.mkdirSync(persistentDir, { recursive: true });
    }

    if (!fs.existsSync(persistentDbPath)) {
      if (fs.existsSync(rootDbPath)) {
        console.log("Inicializando base de datos SQLite en volumen persistente desde /data/data.sqlite...");
        fs.copyFileSync(rootDbPath, persistentDbPath);
      } else if (fs.existsSync(templateDbPath)) {
        console.log("Inicializando base de datos SQLite en volumen persistente desde /prisma/data.sqlite...");
        fs.copyFileSync(templateDbPath, persistentDbPath);
      }
    }

    // Enlaces simbólicos de compatibilidad para evitar divergencia de archivos
    try {
      if (!fs.existsSync(rootDataDir)) {
        fs.mkdirSync(rootDataDir, { recursive: true });
      }
      if (!fs.existsSync(rootDbPath) && fs.existsSync(persistentDbPath)) {
        fs.symlinkSync(persistentDbPath, rootDbPath);
      }
    } catch {}

    try {
      if (!fs.existsSync(templateDbPath) && fs.existsSync(persistentDbPath)) {
        fs.symlinkSync(persistentDbPath, templateDbPath);
      }
    } catch {}

    // 2. Uploads base (cartas, imagenesproductos) en volumen persistente
    const uploadsDir = path.join(cwd, "public", "uploads");
    const defaultUploadsDir = path.join(cwd, "public_uploads_default");

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
    datasources: {
      db: {
        url: `file:${persistentDbPath}`,
      },
    },
    log: ["error", "warn"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
