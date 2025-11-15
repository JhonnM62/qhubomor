import { FaTicketAlt, FaTrophy, FaQrcode } from "react-icons/fa";

type Props = {
  totalGenerated: number;
  totalRedeemed: number;
  last24h: number;
};

export default function StatsBar({ totalGenerated, totalRedeemed, last24h }: Props) {
  return (
    <section className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
      <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-2 shadow-sm">
        <FaTicketAlt size={24} className="text-primary" />
        <span className="text-xs text-muted-foreground">Códigos</span>
        <span className="text-sm font-semibold">{totalGenerated}</span>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-2 shadow-sm">
        <FaTrophy size={24} className="text-primary" />
        <span className="text-xs text-muted-foreground">Canjeados</span>
        <span className="text-sm font-semibold">{totalRedeemed}</span>
      </div>
      <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-2 shadow-sm">
        <FaQrcode size={24} className="text-primary" />
        <span className="text-xs text-muted-foreground">Últimas 24h</span>
        <span className="text-sm font-semibold">{last24h}</span>
      </div>
    </section>
  );
}
