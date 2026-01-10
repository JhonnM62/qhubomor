"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Sparkles, CupSoda, Utensils, AlertCircle, Timer } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PromoFood() {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    // Target date: Jan 31st of the current/next year
    const targetDate = new Date();
    targetDate.setMonth(0); // January (0-indexed)
    targetDate.setDate(31);
    targetDate.setHours(23, 59, 59, 999);
    
    // If today is past Jan 31st, assume next year
    if (new Date() > targetDate) {
      targetDate.setFullYear(targetDate.getFullYear() + 1);
    }

    const interval = setInterval(() => {
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full overflow-hidden py-12 md:py-24 bg-black">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-orange-950/20 to-black opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-orange-600/10 via-black/50 to-black" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-600/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* Badge */}
          <Badge className="px-6 py-2 text-lg font-bold bg-gradient-to-r from-red-500 to-orange-600 text-white border-none animate-bounce shadow-lg shadow-orange-500/20 uppercase tracking-wide">
            <Sparkles className="w-5 h-5 mr-2" />
            ¡Promo Exclusiva de Comida!
          </Badge>

          {/* Main Title Area */}
          <div className="relative mt-8 mb-4 group">
            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
              <div className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                COMIDA
              </div>
              <div className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_0_15px_rgba(234,179,8,0.5)]">
                +
              </div>
              <div className="relative">
                <div className="text-6xl md:text-8xl font-black tracking-tighter text-white drop-shadow-xl transform group-hover:scale-105 transition-transform duration-300">
                  GRANIZADO
                </div>
                <div className="absolute -top-8 -right-8 rotate-12 bg-red-600 text-white font-black text-xl md:text-3xl px-4 py-2 rounded-lg shadow-xl border-4 border-white animate-pulse whitespace-nowrap">
                  ¡GRATIS!
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-2xl md:text-4xl font-bold text-gray-200 max-w-4xl leading-tight">
            Por la compra de cualquier <span className="text-orange-400">Hamburguesa</span>, <span className="text-orange-400">Perro Caliente</span> o <span className="text-orange-400">Plato Principal</span>
          </h2>

          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            {/* Countdown Timer */}
            <Card className="md:col-span-3 bg-gradient-to-r from-gray-900 to-black border-orange-500/30">
              <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-orange-500/20 text-orange-400">
                    <Timer className="w-8 h-8" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-white text-xl">Tiempo Restante</h3>
                    <p className="text-gray-400 text-sm">¡Aprovecha antes que termine!</p>
                  </div>
                </div>
                <div className="flex gap-4 text-center">
                  <div className="bg-white/10 rounded-lg p-3 min-w-[80px]">
                    <div className="text-3xl font-bold text-white">{timeLeft.days}</div>
                    <div className="text-xs text-gray-400 uppercase">Días</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 min-w-[80px]">
                    <div className="text-3xl font-bold text-white">{timeLeft.hours}</div>
                    <div className="text-xs text-gray-400 uppercase">Horas</div>
                  </div>
                  <div className="bg-white/10 rounded-lg p-3 min-w-[80px]">
                    <div className="text-3xl font-bold text-white">{timeLeft.minutes}</div>
                    <div className="text-xs text-gray-400 uppercase">Min</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Details Cards */}
            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-colors group">
              <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                <div className="p-4 rounded-full bg-red-500/20 text-red-400 group-hover:scale-110 transition-transform">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">Vigencia</h3>
                  <p className="text-gray-300">Hasta el 31 de Enero</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-colors group">
              <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                <div className="p-4 rounded-full bg-orange-500/20 text-orange-400 group-hover:scale-110 transition-transform">
                  <Utensils className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">Menú Participante</h3>
                  <p className="text-gray-300">Hamburguesas, Perros y Platos Fuertes</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-colors group">
              <CardContent className="p-6 flex flex-col items-center gap-4 text-center">
                <div className="p-4 rounded-full bg-yellow-500/20 text-yellow-400 group-hover:scale-110 transition-transform">
                  <CupSoda className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-1">Tu Regalo</h3>
                  <p className="text-gray-300">Granizado GRATIS (Igual o menor valor)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold text-xl px-10 py-8 rounded-full shadow-lg shadow-orange-500/25 transition-all hover:scale-105 animate-pulse">
              <Link href="https://wa.me/573044430427?text=Hola,%20quiero%20aprovechar%20la%20promo%20de%20Comida%20+%20Granizado%20Gratis!%20🍔🥤" target="_blank">
                ¡Pedir Promo Ahora!
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-lg px-8 py-8 rounded-full backdrop-blur-sm transition-all">
              <Link href="/links">
                Ver Menú Completo
              </Link>
            </Button>
          </div>

          {/* Terms */}
          <div className="mt-12 p-6 bg-white/5 rounded-2xl max-w-3xl w-full border border-white/5 text-left">
            <div className="flex items-center gap-2 mb-4 text-gray-400">
              <AlertCircle className="w-5 h-5" />
              <span className="font-semibold uppercase text-sm tracking-wider">Términos y Condiciones</span>
            </div>
            <ul className="grid gap-2 text-sm text-gray-400 list-disc list-inside">
              <li>Válido únicamente hasta el 31 de enero.</li>
              <li>Aplica para hamburguesas, perros calientes y platos principales del menú.</li>
              <li>El granizado gratis debe ser de igual o menor valor al plato principal comprado.</li>
              <li>Máximo 7 granizados gratis por cliente (por pedido/mesa).</li>
              <li>No acumulable con otras promociones (como el 2x1 de granizados).</li>
              <li>Sujeto a disponibilidad de productos.</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
