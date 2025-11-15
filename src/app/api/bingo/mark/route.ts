import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const { row, col, marked } = await req.json();
  if ([row, col].some((v: any) => typeof v !== "number" || v < 0 || v > 4)) return NextResponse.json({ error: "Posición inválida" }, { status: 400 });
  const board = await prisma.bingoBoard.findUnique({ where: { userId } });
  if (!board) return NextResponse.json({ error: "Sin tablero" }, { status: 404 });
  let marks: boolean[][];
  try { marks = JSON.parse(board.marks) as boolean[][]; } catch { marks = Array.from({ length: 5 }, () => Array(5).fill(false)); }
  marks[row][col] = !!marked;
  await prisma.bingoBoard.update({ where: { userId }, data: { marks: JSON.stringify(marks), updatedAt: new Date() } });
  return NextResponse.json({ ok: true });
}
