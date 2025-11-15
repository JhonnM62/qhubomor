import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  { name: "Ana P.", text: "Gané 50% de descuento en mi primer intento.", avatar: "A" },
  { name: "Luis M.", text: "Completé los 5 juegos y conseguí un granizado gratis.", avatar: "L" },
  { name: "María R.", text: "La ruleta estuvo épica, me tocó 100%.", avatar: "M" },
];

export default function Testimonials() {
  return (
    <section className="grid gap-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Ganadores felices</h2>
        <p className="text-muted-foreground">Historias reales de jugadores que ya cobraron sus premios.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {testimonials.map((t) => (
          <Card key={t.name} className="transition hover:shadow-md">
            <CardContent className="flex items-start gap-3 p-4">
              <Avatar>
                <AvatarFallback>{t.avatar}</AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{t.name}</div>
                <p className="text-sm text-muted-foreground">{t.text}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
