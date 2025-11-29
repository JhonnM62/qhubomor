import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play } from "@/components/ui/icons";

export default function GamesPage() {
  const games = [
    { href: "/games/dice", title: "Dado" },
    { href: "/games/wheel", title: "Ruleta" },
    { href: "/games/slots", title: "Tragamonedas" },
    { href: "/games/cards", title: "Memoria" },
    { href: "/games/scratch", title: "Rasca y gana" },
  ];
  return (
    <div className="max-w-6xl mx-auto p-3 md:p-4 grid gap-6">
      <div className="rounded-xl border p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <div className="text-lg md:text-xl font-bold">BINGO</div>
          <div className="text-xs md:text-sm text-muted-foreground">Entra a la sala dedicada y juega con otros participantes.</div>
        </div>
        <Button asChild className="h-9 md:h-10 text-sm md:text-base w-full md:w-auto">
          <a href="/bingo"><Play size={20} className="mr-2" /> Iniciar juego</a>
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
        {games.map((g) => (
          <Link key={g.href} href={g.href}>
            <Card className="transition hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-base md:text-lg">{g.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full h-9 md:h-10 text-sm md:text-base" variant="default">
                  <Play className="mr-2 size-4 md:size-5" />
                  Jugar ahora
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
