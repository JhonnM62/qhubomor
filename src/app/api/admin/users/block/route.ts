import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const { email, blocked } = await req.json();
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const me = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!me?.role || me.role.name !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  await prisma.user.update({ where: { email }, data: { blocked: !!blocked } });
  return NextResponse.json({ ok: true });
}
