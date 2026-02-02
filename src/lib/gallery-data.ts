"use server";

import fs from "fs";
import path from "path";

export interface GalleryImage {
  src: string;
  category: "menu-comida" | "menu-granizados" | "productos" | "fachada";
  alt: string;
  width?: number;
  height?: number;
}

export async function getGalleryImages(): Promise<GalleryImage[]> {
  const cartasDir = path.join(process.cwd(), "public/uploads/cartas");
  const productosDir = path.join(process.cwd(), "public/uploads/imagenesproductos");

  const images: GalleryImage[] = [];

  // Helper to read directory safely
  const readDirSafe = (dir: string) => {
    try {
      return fs.readdirSync(dir).filter(file => /\.(jpg|jpeg|png|webp)$/i.test(file));
    } catch (e) {
      console.error(`Error reading directory ${dir}:`, e);
      return [];
    }
  };

  // Process Cartas (Menus)
  const cartasFiles = readDirSafe(cartasDir);
  cartasFiles.forEach(file => {
    const lowerName = file.toLowerCase();
    let category: GalleryImage["category"] = "menu-comida"; // Default fallback
    let alt = "Carta del Menú";

    if (lowerName.includes("comida")) {
      category = "menu-comida";
      alt = "Menú de Comida";
    } else if (lowerName.includes("granizados")) {
      category = "menu-granizados";
      alt = "Menú de Granizados";
    }

    images.push({
      src: `/uploads/cartas/${file}`,
      category,
      alt,
    });
  });

  // Process Productos (Products & Facade)
  const productosFiles = readDirSafe(productosDir);
  productosFiles.forEach(file => {
    const lowerName = file.toLowerCase();
    let category: GalleryImage["category"] = "productos";
    let alt = "Foto del Producto";

    if (lowerName.includes("fachada") || lowerName.includes("logo")) {
      category = "fachada";
      alt = "Fachada de Q'hubo Mor";
    } else {
      category = "productos";
      alt = "Producto Q'hubo Mor";
    }

    images.push({
      src: `/uploads/imagenesproductos/${file}`,
      category,
      alt,
    });
  });

  return images;
}
