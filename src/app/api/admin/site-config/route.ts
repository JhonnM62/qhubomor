import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export const DEFAULT_SITE_CONFIG = {
  siteName: "Q'hubo Mor",
  description: "¡Síguenos en nuestras redes sociales!",
  facebookUrl: "https://www.facebook.com/share/17TBCC1uvw/",
  instagramUrl: "https://www.instagram.com/q.hubo_mor?igsh=MWUyMHZjM2V0MHd5eA==",
  tiktokUrl: "https://www.tiktok.com/@q.hubo_mor?_r=1&_t=ZS-91oYc9Wq6gD",
  whatsappUrl: "https://wa.me/573044430427",
  websiteUrl: "https://qhubomor.com/",
};

export async function GET() {
  try {
    let config = await prisma.siteConfig.findFirst();

    if (!config) {
      config = await prisma.siteConfig.create({
        data: DEFAULT_SITE_CONFIG,
      });
    } else {
      // Si la configuración existe pero los enlaces a redes están vacíos o nulos,
      // poblarlos automáticamente con los enlaces oficiales del negocio
      const needsUpdate =
        !config.facebookUrl ||
        !config.instagramUrl ||
        !config.tiktokUrl ||
        !config.whatsappUrl;

      if (needsUpdate) {
        config = await prisma.siteConfig.update({
          where: { id: config.id },
          data: {
            facebookUrl: config.facebookUrl || DEFAULT_SITE_CONFIG.facebookUrl,
            instagramUrl: config.instagramUrl || DEFAULT_SITE_CONFIG.instagramUrl,
            tiktokUrl: config.tiktokUrl || DEFAULT_SITE_CONFIG.tiktokUrl,
            whatsappUrl: config.whatsappUrl || DEFAULT_SITE_CONFIG.whatsappUrl,
            websiteUrl: config.websiteUrl || DEFAULT_SITE_CONFIG.websiteUrl,
          },
        });
      }
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error fetching site config:", error);
    // Devolver siempre la configuración por defecto para no romper la UI en cliente
    return NextResponse.json(DEFAULT_SITE_CONFIG);
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
        data: {
          ...DEFAULT_SITE_CONFIG,
          ...body,
        },
      });
    }

    return NextResponse.json(config);
  } catch (error) {
    console.error("Error updating site config:", error);
    return NextResponse.json({ error: "Error updating config" }, { status: 500 });
  }
}
