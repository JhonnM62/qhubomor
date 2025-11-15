import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, image: true, role: { select: { name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ users });
}
