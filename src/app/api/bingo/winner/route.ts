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
  const existing = await prisma.bingoWinner.findUnique({ where: { matchId_userId: { matchId, userId } } });
  if (!existing) return NextResponse.json({ ok: false }, { status: 404 });
  const updated = await prisma.bingoWinner.update({ where: { matchId_userId: { matchId, userId } }, data: { nombre, cedula, telefono, direccion, edadConfirmada, cardPhotoPath } });
  return NextResponse.json({ ok: true, winner: updated });
}
export const runtime = "nodejs";
