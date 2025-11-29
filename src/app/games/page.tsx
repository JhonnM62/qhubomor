import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Lock } from "@/components/ui/icons";

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
      
      {/* Aviso de Muy Pronto */}
      <div className="rounded-xl border border-yellow-500/50 bg-yellow-500/10 p-6 text-center">
        <h2 className="text-2xl font-bold text-yellow-500 mb-2">¡Muy Pronto!</h2>
        <p className="text-muted-foreground">
          Estamos preparando los mejores juegos para ti. Regístrate y mantente atento al lanzamiento oficial.
        </p>
      </div>

      <div className="rounded-xl border p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 opacity-50 pointer-events-none select-none grayscale">
        <div className="space-y-1">
          <div className="text-lg md:text-xl font-bold">BINGO</div>
          <div className="text-xs md:text-sm text-muted-foreground">Entra a la sala dedicada y juega con otros participantes.</div>
        </div>
        <Button disabled className="h-9 md:h-10 text-sm md:text-base w-full md:w-auto">
          <Lock size={20} className="mr-2" /> Bloqueado
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 opacity-50 pointer-events-none select-none grayscale">
        {games.map((g) => (
          <Card key={g.href} className="transition">
            <CardHeader>
              <CardTitle className="text-base md:text-lg">{g.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <Button disabled className="w-full h-9 md:h-10 text-sm md:text-base" variant="secondary">
                <Lock className="mr-2 size-4 md:size-5" />
                Muy Pronto
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
