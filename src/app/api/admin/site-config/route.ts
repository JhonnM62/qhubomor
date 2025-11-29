import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const config = await prisma.siteConfig.findFirst();
    return NextResponse.json(config || {});
  } catch (error) {
    return NextResponse.json({ error: "Error fetching config" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user || (session as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    // Check if config exists
    const existingConfig = await prisma.siteConfig.findFirst();

    let config;
    if (existingConfig) {
      config = await prisma.siteConfig.update({
        where: { id: existingConfig.id },
        data: body,
      });
    } else {
      config = await prisma.siteConfig.create({
        data: body,
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating site config:", error);
    return NextResponse.json({ error: "Error updating config" }, { status: 500 });
  }
}
