import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { promises as fs } from "fs";
import path from "path";

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const progress = await prisma.gameProgress.findUnique({ where: { userId } });
  const proofs = await prisma.socialProof.findMany({ where: { userId } });
  const promos = await prisma.promoCode.findMany({ where: { userId } });
  const dump = { user, progress, proofs, promos, at: new Date().toISOString() };
  const dir = path.join(process.cwd(), "public", "backups");
  await fs.mkdir(dir, { recursive: true });
  const file = path.join(dir, `${userId}-${Date.now()}.json`);
  await fs.writeFile(file, JSON.stringify(dump, null, 2));
  return NextResponse.json({ ok: true, file: `/backups/${path.basename(file)}` });
}
