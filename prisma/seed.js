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
}

main()
  .catch((e) => { process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
