import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { SocialPlatform } from "@prisma/client";
import { promises as fs } from "fs";
import path from "path";
import { publish } from "@/lib/events";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  const { platform, imageBase64 } = await req.json();
  if (!platform || !imageBase64) return NextResponse.json({ error: "Datos requeridos" }, { status: 400 });
  const userId = (session.user as any).id ?? (session as any).userId;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const fileName = `${userId}_${platform}.png`;
  const filePath = path.join(dir, fileName);
  const data = imageBase64.split(",")[1] ?? imageBase64;
  await fs.writeFile(filePath, Buffer.from(data, "base64"));
  await prisma.socialProof.upsert({
    where: { userId_platform: { userId, platform: platform as SocialPlatform } },
    update: { screenshotPath: `/uploads/${fileName}` },
    create: { userId, platform: platform as SocialPlatform, screenshotPath: `/uploads/${fileName}` },
  });
  publish(userId, { type: "social", payload: { platform } });
  return NextResponse.json({ ok: true });
}
