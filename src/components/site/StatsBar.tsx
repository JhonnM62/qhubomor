import { Ticket, Trophy, QrCode } from "@/components/ui/icons";

type Props = {
  totalGenerated: number;
  totalRedeemed: number;
  last24h: number;
};

export default function StatsBar({ totalGenerated, totalRedeemed, last24h }: Props) {
  return (
    <section className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
      <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-2 shadow-sm">
        <Ticket className="text-primary size-5 md:size-6" />
        <span className="text-[11px] md:text-xs text-muted-foreground">Códigos</span>
        <span className="text-sm md:text-base font-semibold">{totalGenerated}</span>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-2 shadow-sm">
        <Trophy className="text-primary size-5 md:size-6" />
        <span className="text-[11px] md:text-xs text-muted-foreground">Canjeados</span>
        <span className="text-sm md:text-base font-semibold">{totalRedeemed}</span>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-2 shadow-sm">
        <QrCode className="text-primary size-5 md:size-6" />
        <span className="text-[11px] md:text-xs text-muted-foreground">Últimas 24h</span>
        <span className="text-sm md:text-base font-semibold">{last24h}</span>
      </div>
    </section>
  );
}
