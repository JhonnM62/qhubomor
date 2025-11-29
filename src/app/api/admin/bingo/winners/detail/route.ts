import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = String(searchParams.get("id") ?? "");
  if (!id) return NextResponse.json({ ok: false }, { status: 400 });
  const winner = await prisma.bingoWinner.findUnique({ where: { id }, include: { user: { include: { role: true } } } });
  return NextResponse.json({ winner });
}
