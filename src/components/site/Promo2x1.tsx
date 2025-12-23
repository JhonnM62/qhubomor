"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Sparkles, CupSoda } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Promo2x1() {
  return (
    <section className="relative w-full overflow-hidden py-12 md:py-24">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-black via-purple-950 to-black opacity-90" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-black/50 to-black" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-pink-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl animate-pulse delay-700" />
      </div>

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center text-center space-y-8">
          
          {/* Badge */}
          <Badge className="px-4 py-1.5 text-lg font-bold bg-gradient-to-r from-yellow-400 to-orange-500 text-black border-none animate-bounce shadow-lg shadow-orange-500/20">
            <Sparkles className="w-4 h-4 mr-2" />
            ¡OFERTA POR TIEMPO LIMITADO!
          </Badge>

          {/* Main Title Area */}
          <div className="relative inline-block mt-4 group">
            <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)] transform transition-transform group-hover:scale-105 duration-300">
              2x1
            </h1>
            <div className="absolute -top-6 -right-6 md:-top-8 md:-right-12 rotate-12 bg-white text-black font-black text-xl md:text-2xl px-3 py-1 md:px-4 md:py-2 rounded-lg shadow-xl border-4 border-yellow-400 animate-pulse">
              ¡GRATIS!
            </div>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight drop-shadow-md">
            En Granizados de <span className="text-yellow-400 underline decoration-wavy decoration-pink-500">12 Onzas</span>
          </h2>

          <p className="max-w-2xl text-xl md:text-2xl text-gray-200 font-medium leading-relaxed">
            Ven con tu pareja, amigos o familia y disfruta el doble. 
            <br />
            <span className="text-pink-400 font-bold">¡Pagas uno y te llevas dos!</span>
          </p>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mt-8">
            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-colors group">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="p-3 rounded-full bg-pink-500/20 text-pink-400 group-hover:scale-110 transition-transform">
                  <Clock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-lg">Vigencia</h3>
                  <p className="text-gray-300">Hasta el 31 de Diciembre</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-colors group">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-400 group-hover:scale-110 transition-transform">
                  <CupSoda className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-lg">Producto</h3>
                  <p className="text-gray-300">Granizados de 12oz</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:bg-white/10 transition-colors group">
              <CardContent className="p-6 flex flex-col items-center gap-4">
                <div className="p-3 rounded-full bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                  <MapPin className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-bold text-white text-lg">Ubicación</h3>
                  <p className="text-gray-300">Mistares 3 casa 182</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center pt-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white font-bold text-lg px-8 py-6 rounded-full shadow-lg shadow-pink-500/25 transition-all hover:scale-105">
              <Link href="https://wa.me/573044430427" target="_blank">
                ¡Quiero mi 2x1!
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/5 hover:bg-white/10 text-white font-bold text-lg px-8 py-6 rounded-full backdrop-blur-sm transition-all">
              <Link href="/links">
                Ver Ubicación
              </Link>
            </Button>
          </div>

          <p className="text-sm text-gray-500 mt-8 max-w-lg">
            *Aplican términos y condiciones. Válido únicamente para granizados de 12 onzas. No acumulable con otras promociones. Promoción válida hasta agotar existencias o hasta la fecha límite.
          </p>
        </div>
      </div>
    </section>
  );
}
