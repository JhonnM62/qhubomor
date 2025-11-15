import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const me = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!me?.role || me.role.name !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, role: { select: { name: true } } } });
  const roles = await prisma.role.findMany({ select: { id: true, name: true } });
  return NextResponse.json({ users, roles });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const me = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!me?.role || me.role.name !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  const { email, role } = await req.json();
  if (!email || !role) return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
  const roleObj = await prisma.role.findUnique({ where: { name: role } });
  if (!roleObj) return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
  await prisma.user.update({ where: { email }, data: { roleId: roleObj.id } });
  return NextResponse.json({ ok: true });
}
