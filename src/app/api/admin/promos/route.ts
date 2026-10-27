import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const promos = await prisma.promoCode.findMany({ include: { User: { select: { id: true, email: true } } } });
  return NextResponse.json({ promos });
}
