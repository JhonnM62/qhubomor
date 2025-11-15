import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const prizes = [
  { key: "DISCOUNT_15", title: "Descuento 15%", desc: "Ahorra en tu compra." },
  { key: "DISCOUNT_50", title: "Descuento 50%", desc: "Mitad de precio." },
  { key: "DISCOUNT_100", title: "Compra gratis", desc: "100% de descuento." },
  { key: "GRANIZADO_8OZ", title: "Granizado 8 oz", desc: "Refrescante y delicioso." },
];

function PrizeImage({ type }: { type: string }) {
  if (type === "GRANIZADO_8OZ") {
    return (
      <svg viewBox="0 0 64 64" className="h-12 w-12">
        <circle cx="32" cy="32" r="30" fill="#e0f2fe" />
        <rect x="24" y="20" width="16" height="28" rx="8" fill="#38bdf8" />
        <rect x="27" y="24" width="10" height="20" rx="5" fill="#7dd3fc" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="h-12 w-12">
      <rect x="6" y="14" width="52" height="36" rx="8" fill="#fde68a" />
      <text x="32" y="36" textAnchor="middle" fontSize="16" fill="#78350f">%-OFF</text>
    </svg>
  );
}

export default function Prizes() {
  return (
    <section className="grid gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Premios disponibles</h2>
        <p className="text-muted-foreground">Descuentos y bebidas gratis al completar los retos.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {prizes.map((p) => (
          <Card key={p.key} className="transition hover:shadow-md">
            <CardHeader className="flex items-center gap-3">
              <PrizeImage type={p.key} />
              <CardTitle className="text-base">{p.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{p.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
