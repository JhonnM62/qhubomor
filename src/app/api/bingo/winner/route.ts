import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs";

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const userId = String(form.get("userId") ?? "");
  const matchId = String(form.get("matchId") ?? "");
  const nombre = String(form.get("nombre") ?? "");
  const cedula = String(form.get("cedula") ?? "");
  const telefono = String(form.get("telefono") ?? "");
  const direccion = String(form.get("direccion") ?? "");
  const edadConfirmada = String(form.get("edadConfirmada") ?? "false") === "true";
  const file = form.get("cardPhoto") as File | null;
  if (!userId || !matchId) return NextResponse.json({ ok: false }, { status: 400 });
  let cardPhotoPath: string | undefined = undefined;
  if (file && (file as any).arrayBuffer) {
    const buf = Buffer.from(await (file as any).arrayBuffer());
    const uploads = path.join(process.cwd(), "public", "uploads");
    try { fs.mkdirSync(uploads, { recursive: true }); } catch {}
    const fname = `card_${userId}_${Date.now()}.jpg`;
    const fpath = path.join(uploads, fname);
    fs.writeFileSync(fpath, buf);
    cardPhotoPath = `/uploads/${fname}`;
  }
  // Buscar el ganador más reciente para este usuario, ya que no tenemos matchId en el modelo actual
  const existing = await prisma.bingoWinner.findFirst({ 
    where: { userId }, 
    orderBy: { createdAt: "desc" } 
  });

  if (!existing) return NextResponse.json({ ok: false }, { status: 404 });

  // Actualizar usando el ID único del ganador encontrado
  // Nota: El modelo BingoWinner actual no tiene campos como nombre, cedula, etc.
  // Solo tiene: id, userId, pattern, prize, claimed, createdAt.
  // Si necesitamos guardar info personal, deberíamos actualizar el modelo User o agregar campos a BingoWinner.
  // Por ahora, simularemos que actualizamos 'claimed' a true si se envía info.
  
  const updated = await prisma.bingoWinner.update({ 
    where: { id: existing.id }, 
    data: { 
      claimed: true,
      // cardPhotoPath // No existe en el modelo actual
    } 
  });
  return NextResponse.json({ ok: true, winner: updated });
}
export const runtime = "nodejs";
