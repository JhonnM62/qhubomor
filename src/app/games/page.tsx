import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaPlay } from "react-icons/fa";

export default function GamesPage() {
  const games = [
    { href: "/games/dice", title: "Dado" },
    { href: "/games/wheel", title: "Ruleta" },
    { href: "/games/slots", title: "Tragamonedas" },
    { href: "/games/cards", title: "Memoria" },
    { href: "/games/scratch", title: "Rasca y gana" },
  ];
  return (
    <div className="max-w-6xl mx-auto p-4 grid gap-6">
      <div className="rounded-xl border p-6 flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-xl font-bold">BINGO</div>
          <div className="text-sm text-muted-foreground">Entra a la sala dedicada y juega con otros participantes.</div>
        </div>
        <Button asChild className="h-10 text-base">
          <a href="/bingo"><FaPlay size={20} className="mr-2" /> Iniciar juego</a>
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {games.map((g) => (
          <Link key={g.href} href={g.href}>
            <Card className="transition hover:shadow-lg">
              <CardHeader>
                <CardTitle>{g.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <Button className="w-full h-10 text-base" variant="default">
                  <FaPlay size={20} className="mr-2" />
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
