/**
 * Optimiza (una sola vez) las imágenes del catálogo de la galería.
 *
 * - public/uploads/cartas            -> máx. 2000 px lado largo, WebP q=85 (texto pequeño legible)
 * - public/uploads/imagenesproductos -> máx. 1600 px lado largo, WebP q=80
 *
 * Corrige la rotación EXIF, elimina metadatos y reemplaza el original (.jpg/.jpeg/.png)
 * por un archivo .webp con el mismo nombre base.
 *
 * Uso: node scripts/optimize-gallery.mjs
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = path.join(process.cwd(), "public", "uploads");

const TARGETS = [
  { dir: "cartas", maxSize: 2000, quality: 85 },
  { dir: "imagenesproductos", maxSize: 1600, quality: 80 },
];

const SOURCE_EXT = /\.(jpe?g|png)$/i;

const kb = (bytes) => `${Math.round(bytes / 1024)} KB`;

let totalBefore = 0;
let totalAfter = 0;

for (const { dir, maxSize, quality } of TARGETS) {
  const fullDir = path.join(ROOT, dir);
  if (!fs.existsSync(fullDir)) {
    console.warn(`No existe ${fullDir}, se omite.`);
    continue;
  }

  const files = fs.readdirSync(fullDir).filter((f) => SOURCE_EXT.test(f));

  for (const file of files) {
    const src = path.join(fullDir, file);
    const dest = path.join(fullDir, file.replace(SOURCE_EXT, ".webp"));

    if (fs.existsSync(dest)) {
      console.warn(`Ya existe ${path.basename(dest)}, se omite ${file}.`);
      continue;
    }

    const before = fs.statSync(src).size;

    await sharp(src)
      .rotate() // aplica orientación EXIF
      .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(dest);

    const after = fs.statSync(dest).size;
    totalBefore += before;
    totalAfter += after;

    fs.unlinkSync(src);
    console.log(`${dir}/${file} -> ${path.basename(dest)}: ${kb(before)} -> ${kb(after)}`);
  }
}

console.log(`\nTotal: ${kb(totalBefore)} -> ${kb(totalAfter)}`);
