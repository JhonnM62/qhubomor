import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FaDiceSix, FaCompactDisc, FaStar, FaGripHorizontal, FaGamepad } from "react-icons/fa";

const games = [
  { href: "/games/dice", title: "Dado", desc: "Lanza y gana con 4+", icon: FaDiceSix },
  { href: "/games/wheel", title: "Ruleta", desc: "Giros a la suerte", icon: FaCompactDisc },
  { href: "/games/slots", title: "Tragamonedas", desc: "Combina símbolos", icon: FaStar },
  { href: "/games/cards", title: "Memoria", desc: "Encuentra pares", icon: FaGripHorizontal },
  { href: "/games/scratch", title: "Rasca y gana", desc: "Descubre el premio", icon: FaGamepad },
];

export default function FeaturedGames() {
  return (
    <section className="grid gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Juegos populares</h2>
        <p className="text-muted-foreground">Cinco retos rápidos, diversión y premios asegurados.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {games.map((g) => {
          const Icon = g.icon;
          return (
            <Link key={g.href} href={g.href}>
              <Card className="transition hover:shadow-md">
                <CardHeader className="flex flex-row items-center gap-3">
                  <Icon size={24} className="text-primary" />
                  <CardTitle className="text-base">{g.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{g.desc}</p>
                  <Button size="sm" variant="secondary">Jugar</Button>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
