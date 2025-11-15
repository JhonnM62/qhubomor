import FeaturedGames from "@/components/site/FeaturedGames";
import Prizes from "@/components/site/Prizes";
import Testimonials from "@/components/site/Testimonials";
import CTARegister from "@/components/site/CTARegister";
import StatsBar from "@/components/site/StatsBar";
import Gamification from "@/components/site/Gamification";
import { prisma } from "@/lib/prisma";
import BingoLobby from "@/components/games/BingoLobby";

export default async function Home() {
  const hasDb = !!process.env.DATABASE_URL;
  let totalGenerated = 0;
  let totalRedeemed = 0;
  let last24h = 0;
  let usersCount = 0;
  if (hasDb) {
    try {
      totalGenerated = await prisma.promoCode.count();
      totalRedeemed = await prisma.promoCode.count({ where: { redeemed: true } });
      last24h = await prisma.promoCode.count({ where: { redeemed: true, redeemedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } } });
      usersCount = await prisma.user.count({ where: { role: { name: { not: "ADMIN" } } } });
    } catch {}
  }
  const pot = 200000 + usersCount * 2000;
  return (
    <div className="relative">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background to-muted/40" />
      <main className="max-w-6xl mx-auto px-6 py-10 grid gap-10">
        <BingoLobby pot={pot} eventDate="2025-12-13T00:00:00Z" />
        <StatsBar totalGenerated={totalGenerated} totalRedeemed={totalRedeemed} last24h={last24h} />
        <FeaturedGames />
        <Prizes />
        <Testimonials />
        <Gamification />
        <CTARegister />
      </main>
    </div>
  );
}
