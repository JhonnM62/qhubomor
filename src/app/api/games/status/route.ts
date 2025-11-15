import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const progress = await prisma.gameProgress.findUnique({ where: { userId } });
  const proofs = await prisma.socialProof.findMany({ where: { userId } });
  const gamesCompleted = progress ? [progress.game1Completed, progress.game2Completed, progress.game3Completed, progress.game4Completed, progress.game5Completed].filter(Boolean).length : 0;
  const totalGames = 5;
  const socialProofs = proofs.length;
  const totalProofs = 3;
  const gamesPercent = gamesCompleted / totalGames;
  const proofsPercent = socialProofs / totalProofs;
  const overall = Math.round(((gamesPercent + proofsPercent) / 2) * 100);
  const remainingOverall = Math.max(0, 100 - overall);
  return NextResponse.json({ gamesCompleted, totalGames, socialProofs, totalProofs, overall, remainingOverall });
}
