import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const data = await req.json();
  const { imageBase64 } = data ?? {};
  if (!imageBase64) return NextResponse.json({ error: "Imagen requerida" }, { status: 400 });
  const raw = imageBase64.split(",")[1] ?? imageBase64;
  const buf = Buffer.from(raw, "base64");
  if (buf.length > 2 * 1024 * 1024) return NextResponse.json({ error: "Imagen demasiado grande" }, { status: 400 });
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const fileName = `avatar_${userId}.png`;
  const filePath = path.join(dir, fileName);
  await fs.writeFile(filePath, buf);
  await prisma.user.update({ where: { id: userId }, data: { image: `/uploads/${fileName}` } });
  return NextResponse.json({ ok: true, image: `/uploads/${fileName}` });
}
