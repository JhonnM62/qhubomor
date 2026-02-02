"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CupSoda, Utensils } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative w-full h-[80vh] flex items-center justify-center overflow-hidden bg-black">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black z-10" />
        <div className="absolute inset-0 bg-[url('/images/logo1200x630.png')] bg-cover bg-center opacity-30 blur-sm scale-105 animate-pulse-slow" />
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/20 via-transparent to-orange-900/20" />
      </div>

      <div className="container relative z-20 mx-auto px-4 text-center">
        <div className="animate-fade-in-up space-y-6">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
              Q'HUBO MOR
            </span>
            <br />
            <span className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white mt-4 block">
              Granizados & Comida
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-gray-200 font-medium leading-relaxed">
            Los mejores granizados con y sin licor de Ipiales. 
            Disfruta de cocteles, micheladas y un ambiente increíble.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
            <Button asChild size="lg" className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-black font-bold text-lg px-8 py-6 rounded-full shadow-lg hover:scale-105 transition-all">
              <Link href="#products">
                <CupSoda className="mr-2 h-6 w-6" />
                Ver Menú
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/30 bg-white/10 hover:bg-white/20 text-white font-bold text-lg px-8 py-6 rounded-full backdrop-blur-md hover:scale-105 transition-all">
              <Link href="#location">
                <Utensils className="mr-2 h-6 w-6" />
                Visítanos
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
