import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const winners = await prisma.bingoWinner.findMany({ include: { user: { include: { role: true } } }, orderBy: { createdAt: "desc" } });
  return NextResponse.json({ winners });
}
