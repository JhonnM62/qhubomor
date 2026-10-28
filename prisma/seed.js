const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  const roles = ["ADMIN", "USER"];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  if (adminEmail && adminPassword) {
    const adminRole = await prisma.role.findUnique({ where: { name: "ADMIN" } });
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    const hash = await bcrypt.hash(adminPassword, 10);
    if (!existing) {
      const user = await prisma.user.create({
        data: {
          email: adminEmail,
          name: "Administrador",
          passwordHash: hash,
          dob: new Date("1990-01-01T00:00:00Z"),
          roleId: adminRole?.id,
        },
      });
      await prisma.gameProgress.create({ data: { userId: user.id } });
    } else if (!existing.roleId && adminRole) {
      await prisma.user.update({ where: { email: adminEmail }, data: { roleId: adminRole.id } });
    }
  }

  // Sembrar o actualizar configuración oficial del sitio y redes sociales
  const defaultSocial = {
    siteName: "Q'hubo Mor",
    description: "¡Síguenos en nuestras redes sociales!",
    facebookUrl: "https://www.facebook.com/share/17TBCC1uvw/",
    instagramUrl: "https://www.instagram.com/q.hubo_mor?igsh=MWUyMHZjM2V0MHd5eA==",
    tiktokUrl: "https://www.tiktok.com/@q.hubo_mor?_r=1&_t=ZS-91oYc9Wq6gD",
    whatsappUrl: "https://wa.me/573044430427",
    websiteUrl: "https://qhubomor.com/",
  };

  const existingConfig = await prisma.siteConfig.findFirst();
  if (!existingConfig) {
    await prisma.siteConfig.create({ data: defaultSocial });
  } else {
    await prisma.siteConfig.update({
      where: { id: existingConfig.id },
      data: {
        facebookUrl: existingConfig.facebookUrl || defaultSocial.facebookUrl,
        instagramUrl: existingConfig.instagramUrl || defaultSocial.instagramUrl,
        tiktokUrl: existingConfig.tiktokUrl || defaultSocial.tiktokUrl,
        whatsappUrl: existingConfig.whatsappUrl || defaultSocial.whatsappUrl,
        websiteUrl: existingConfig.websiteUrl || defaultSocial.websiteUrl,
      },
    });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
