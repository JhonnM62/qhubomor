"use client";

import { Card, CardContent } from "@/components/ui/card";
import { CupSoda, Beer, Sandwich, Pizza } from "lucide-react";
import Image from "next/image";

export default function ProductShowcase() {
  const categories = [
    {
      title: "Granizados con Licor",
      icon: <CupSoda className="w-12 h-12 text-pink-500" />,
      description: "Deliciosas combinaciones con tus licores favoritos.",
      color: "from-pink-500/20 to-purple-500/20",
      borderColor: "border-pink-500/30"
    },
    {
      title: "Granizados sin Licor",
      icon: <CupSoda className="w-12 h-12 text-blue-400" />,
      description: "Refrescantes sabores frutales para todos.",
      color: "from-blue-400/20 to-cyan-500/20",
      borderColor: "border-blue-400/30"
    },
    {
      title: "Comida Rápida",
      icon: <Sandwich className="w-12 h-12 text-orange-500" />,
      description: "Hamburguesas, perros calientes y más.",
      color: "from-orange-500/20 to-red-500/20",
      borderColor: "border-orange-500/30"
    },
    {
      title: "Micheladas y Cocteles",
      icon: <Beer className="w-12 h-12 text-yellow-400" />,
      description: "Las mejores micheladas y coctelería clásica.",
      color: "from-yellow-400/20 to-amber-500/20",
      borderColor: "border-yellow-400/30"
    }
  ];

  return (
    <section id="products" className="py-20 bg-black relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Nuestros <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-600">Productos</span>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Calidad, sabor y la mejor experiencia en cada pedido.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <Card key={index} className={`bg-gradient-to-br ${category.color} ${category.borderColor} border backdrop-blur-sm hover:scale-105 transition-all duration-300 group`}>
              <CardContent className="p-8 flex flex-col items-center text-center h-full justify-center space-y-6">
                <div className="p-4 rounded-full bg-black/40 group-hover:bg-black/60 transition-colors shadow-xl">
                  {category.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">{category.title}</h3>
                  <p className="text-gray-300 font-medium">{category.description}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
