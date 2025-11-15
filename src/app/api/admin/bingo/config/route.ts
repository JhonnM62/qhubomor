import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const me = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!me?.role || me.role.name !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const cfg = await prisma.bingoConfig.findFirst({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ config: cfg });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const me = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!me?.role || me.role.name !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const body = await req.json();
  const cfg = await prisma.bingoConfig.create({ data: {
    ballsNumber: Number(body.ballsNumber ?? 75),
    roundDuration: Number(body.roundDuration ?? 300),
    prizes: body.prizes ? JSON.stringify(body.prizes) : null,
    restrictions: body.restrictions ? JSON.stringify(body.restrictions) : null,
  } });
  return NextResponse.json({ config: cfg });
}
