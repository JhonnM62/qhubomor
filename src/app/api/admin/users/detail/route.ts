import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const me = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!me?.role || me.role.name !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  if (!id) return NextResponse.json({ error: "ID requerido" }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id }, include: { role: true } });
  const progress = await prisma.gameProgress.findUnique({ where: { userId: id } });
  const attempts = await prisma.gameAttempt.findMany({ where: { userId: id } });
  const promos = await prisma.promoCode.findMany({ where: { userId: id }, orderBy: { expiresAt: "desc" } });
  // const reports = await prisma.report.findMany({ where: { userId: id }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ user, progress, attempts, promos, reports: [] });
}
