"use client";

import { MapPin, Phone, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function LocationSection() {
  return (
    <section id="location" className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Visítanos en <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">Ipiales</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Estamos ubicados en un lugar estratégico para que disfrutes con tus amigos.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Info Cards */}
          <div className="space-y-6 lg:col-span-1">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 flex items-start space-x-4">
                <MapPin className="w-8 h-8 text-red-500 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Dirección</h3>
                  <p className="text-gray-300">Mistares 3 casa 182</p>
                  <p className="text-gray-400 text-sm mt-1">Diagonal al antiguo asaditos</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 flex items-start space-x-4">
                <Phone className="w-8 h-8 text-green-500 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Contacto</h3>
                  <p className="text-gray-300">+57 304 443 0427</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-6 flex items-start space-x-4">
                <Clock className="w-8 h-8 text-yellow-500 shrink-0" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Horario</h3>
                  <p className="text-gray-300">Abierto todos los días</p>
                  <p className="text-gray-400 text-sm mt-1">Ven a disfrutar de la mejor música</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Map Embed */}
          <div className="lg:col-span-2 h-[400px] md:h-[500px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 relative bg-gray-800">
            <iframe 
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3989.398962963736!2d-77.65393399999999!3d0.8307245000000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e296914cb006b37%3A0x8decc1f7420eb9fd!2sQ%20hubo%20mor%20Granizados!5e0!3m2!1ses-419!2sco!4v1770042938763!5m2!1ses-419!2sco" 
              width="100%" 
              height="100%" 
              style={{ border: 0 }} 
              allowFullScreen={true} 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 w-full h-full"
              title="Ubicación Q'hubo Mor Granizados"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
