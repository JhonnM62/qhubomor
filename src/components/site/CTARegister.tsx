import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function CTARegister() {
  return (
    <section className="relative overflow-hidden rounded-xl border">
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-fuchsia-500 via-pink-500 to-orange-400 opacity-20" />
      <div className="grid gap-3 p-6 text-center">
        <h2 className="text-2xl font-bold">Regístrate y juega en 3 pasos</h2>
        <p className="text-muted-foreground">Crea tu cuenta, completa los juegos y reclama tu premio con QR.</p>
        <div className="flex justify-center">
          <Button asChild size="lg">
            <Link href="/register">Crear cuenta</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
