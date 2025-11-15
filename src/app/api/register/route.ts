import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isAdult } from "@/lib/age";
import { hash } from "bcrypt";

export async function POST(req: Request) {
  const data = await req.json();
  const { name, email, password, dob } = data ?? {};
  if (!name || !email || !password || !dob) return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  const birth = new Date(dob);
  if (!isAdult(birth)) return NextResponse.json({ error: "Debes ser mayor de edad" }, { status: 400 });
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: "El email ya está registrado" }, { status: 400 });
  const passwordHash = await hash(password, 10);
  const userRole = await prisma.role.findUnique({ where: { name: "USER" } });
  const user = await prisma.user.create({ data: { name, email, dob: birth, passwordHash, roleId: userRole?.id } });
  await prisma.gameProgress.create({ data: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
