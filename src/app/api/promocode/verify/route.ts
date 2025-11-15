import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { code } = await req.json();
  if (!code) return NextResponse.json({ error: "Código requerido" }, { status: 400 });
  const promo = await prisma.promoCode.findUnique({ where: { code } });
  if (!promo) return NextResponse.json({ error: "Código inválido" }, { status: 404 });
  if (promo.redeemed) return NextResponse.json({ error: "Código ya canjeado" }, { status: 400 });
  await prisma.promoCode.update({ where: { code }, data: { redeemed: true, redeemedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
