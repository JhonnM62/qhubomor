import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { PrizeType, SocialPlatform } from "@prisma/client";
import { env } from "@/lib/env";

function randomCode(prefix: string) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < 8; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}-${s}`;
}

export async function POST() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const progress = await prisma.gameProgress.findUnique({ where: { userId } });
  if (!progress || !progress.completedAt) return NextResponse.json({ error: "Completa los 5 juegos" }, { status: 400 });
  const proofs = await prisma.socialProof.findMany({ where: { userId } });
  const needed = [SocialPlatform.FACEBOOK, SocialPlatform.INSTAGRAM, SocialPlatform.TIKTOK];
  const ok = needed.every((p) => proofs.find((x) => x.platform === p));
  if (!ok) return NextResponse.json({ error: "Sube las 3 capturas de redes" }, { status: 400 });
  const types = [PrizeType.DISCOUNT_15, PrizeType.DISCOUNT_50, PrizeType.DISCOUNT_100, PrizeType.GRANIZADO_8OZ];
  const prizeType = types[Math.floor(Math.random() * types.length)];
  const code = randomCode(env.PROMO_CODE_PREFIX);
  const qrData = JSON.stringify({ code, prizeType, userId });
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days validity
  const promo = await prisma.promoCode.create({ data: { userId, code, prizeType, qrData, expiresAt } });
  return NextResponse.json({ ok: true, promo });
}
