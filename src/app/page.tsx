import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Calendar, MapPin, Gift, Dices } from "@/components/ui/icons";
import Image from "next/image";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Hero Section con gradiente animado */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black via-emerald-950 to-black opacity-95" />
      
      <main className="flex-1 max-w-6xl mx-auto px-4 py-12 grid gap-16 text-center text-white relative z-10">
        
        {/* Sección Principal del Aniversario */}
        <section className="space-y-6 md:space-y-8 animate-in fade-in zoom-in duration-1000 slide-in-from-bottom-10">
          <div className="mb-4 relative inline-block">
            <div className="absolute -top-2 -right-2 md:-top-4 md:-right-4 bg-yellow-500 text-black font-extrabold text-lg md:text-xl w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full animate-bounce z-20 border-2 border-white shadow-lg">
              2º
            </div>
            <div className="w-[180px] h-[180px] md:w-[250px] md:h-[250px] relative mx-auto">
              <Image
                src="/images/logosinfondo.png"
                alt="Q'hubo Mor Logo"
                fill
                className="object-contain animate-pulse drop-shadow-2xl rounded-full mix-blend-screen"
              />
            </div>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 drop-shadow-lg px-2 mb-2">
            GRAN 2º ANIVERSARIO
            <br />
            <span className="text-white">Q'HUBO MOR</span>
          </h1>

          <h2 className="text-xl sm:text-2xl md:text-4xl font-bold text-gray-100 tracking-wide uppercase drop-shadow-md">
            Granizados con y sin Licor en Ipiales
          </h2>
          
          <p className="text-lg md:text-2xl text-gray-300 font-light max-w-3xl mx-auto leading-relaxed px-4 mt-6">
            Celebra con nosotros. Disfruta de los mejores cocteles, micheladas, música y premios increíbles.
          </p>

          {/* Detalles del Evento */}
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 md:gap-6 mt-8 px-4">
            <div className="flex items-center justify-center gap-3 bg-white/10 px-4 py-3 rounded-full backdrop-blur border border-white/20 w-full sm:w-auto">
              <Calendar className="text-yellow-400 w-5 h-5 md:w-6 md:h-6" />
              <span className="text-base md:text-lg font-semibold">20 de Diciembre, 2025</span>
            </div>
            <div className="flex items-center justify-center gap-3 bg-white/10 px-4 py-3 rounded-full backdrop-blur border border-white/20 w-full sm:w-auto">
              <MapPin className="text-red-400 w-5 h-5 md:w-6 md:h-6" />
              <span className="text-sm md:text-lg font-semibold text-center">Mistares 3 casa 182 Diagonal al antiguo asaditos</span>
            </div>
          </div>
        </section>

        {/* Sección de Premios y Ruleta */}
        <section className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto w-full">
          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500/30 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <CardHeader>
              <Dices className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
              <CardTitle className="text-2xl font-bold text-yellow-400">Ruleta de la Suerte</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-lg">
                ¡Participa en nuestro juego físico de la ruleta! Por cada compra de Granizados especiales tendrás la oportunidad de girar y ganar al instante.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-yellow-500/30 shadow-2xl transform hover:scale-105 transition-all duration-300">
            <CardHeader>
              <Gift className="w-16 h-16 text-red-500 mx-auto mb-4 animate-bounce" />
              <CardTitle className="text-2xl font-bold text-yellow-400">Premios en Efectivo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300 text-lg">
                Gana bonos de consumo y premios en efectivo de hasta
                <span className="block text-4xl font-bold text-green-400 mt-2">$200.000</span>
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Call to Action */}
        <section className="space-y-6 pt-8 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-white">¡No te lo pierdas!</h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg">
            Regístrate ahora para recibir notificaciones exclusivas y asegurar tu participación en los sorteos especiales de la noche.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold text-lg px-8 py-6 rounded-full shadow-lg shadow-yellow-500/20 transition-all hover:scale-110 w-full sm:w-auto">
              <Link href="/register">Registrarme Ahora</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white text-white hover:bg-white/10 font-bold text-lg px-8 py-6 rounded-full transition-all w-full sm:w-auto">
              <Link href="/links">Nuestras Redes</Link>
            </Button>
          </div>
        </section>

      </main>
    </div>
  );
}
