import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { publish } from "@/lib/events";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const { game, win } = await req.json();
  if (!game) return NextResponse.json({ error: "Juego requerido" }, { status: 400 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const day = new Date(); day.setHours(0,0,0,0);
  const attemptKey = { userId_game_date: { userId, game: String(game), date: day } } as any;
  const current = await prisma.gameAttempt.findUnique({ where: attemptKey }).catch(() => null);
  const limit = Number(process.env.GAME_DAILY_LIMIT ?? "5");
  if (!current) {
    await prisma.gameAttempt.create({ data: { userId, game: String(game), date: day, used: 0, limit } });
  }
  const afterCheck = await prisma.gameAttempt.findUnique({ where: attemptKey });
  if (afterCheck && afterCheck.used >= (afterCheck.limit ?? limit)) {
    return NextResponse.json({ error: "Límite diario alcanzado" }, { status: 429 });
  }
  await prisma.gameAttempt.update({ where: attemptKey, data: { used: { increment: 1 } } });
  const progress = await prisma.gameProgress.findUnique({ where: { userId } });
  if (!progress) await prisma.gameProgress.create({ data: { userId } });
  const field = {
    dice: "game1Completed",
    wheel: "game2Completed",
    slots: "game3Completed",
    cards: "game4Completed",
    scratch: "game5Completed",
  }[game as string] as keyof typeof progress | undefined;
  if (!field) return NextResponse.json({ error: "Juego inválido" }, { status: 400 });
  if (!win) {
    publish(userId, { type: "attempt", payload: await status(userId) });
    return NextResponse.json({ ok: true });
  }
  const updated = await prisma.gameProgress.update({
    where: { userId },
    data: {
      [field]: true,
      totalWins: { increment: 1 },
    },
  });
  publish(userId, { type: "progress", payload: await status(userId) });
  let completedAt: Date | null = null;
  if (
    updated.game1Completed &&
    updated.game2Completed &&
    updated.game3Completed &&
    updated.game4Completed &&
    updated.game5Completed &&
    !updated.completedAt
  ) {
    const res = await prisma.gameProgress.update({ where: { userId }, data: { completedAt: new Date() } });
    completedAt = res.completedAt ?? null;
  }
  return NextResponse.json({ ok: true, completedAt });
}

async function status(userId: string) {
  const progress = await prisma.gameProgress.findUnique({ where: { userId } });
  const proofs = await prisma.socialProof.findMany({ where: { userId } });
  const gamesCompleted = progress ? [progress.game1Completed, progress.game2Completed, progress.game3Completed, progress.game4Completed, progress.game5Completed].filter(Boolean).length : 0;
  const totalGames = 5;
  const socialProofs = proofs.length;
  const totalProofs = 3;
  const gamesPercent = gamesCompleted / totalGames;
  const proofsPercent = socialProofs / totalProofs;
  const overall = Math.round(((gamesPercent + proofsPercent) / 2) * 100);
  return { gamesCompleted, totalGames, socialProofs, totalProofs, overall };
}
