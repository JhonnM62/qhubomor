import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, name: true, email: true, image: true, role: { select: { name: true } } } });
  const progress = await prisma.gameProgress.findUnique({ where: { userId } });
  const proofs = await prisma.socialProof.findMany({ where: { userId } });
  const promos = await prisma.promoCode.findMany({ where: { userId }, orderBy: { expiresAt: "desc" } });
  return NextResponse.json({ user, progress, proofs, promos });
}
