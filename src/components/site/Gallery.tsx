"use client";

import { useState } from "react";
import Image from "next/image";
import { GalleryImage } from "@/lib/gallery-data";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X, Maximize2 } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { id: "all", label: "Todo" },
  { id: "menu-granizados", label: "Menú Granizados" },
  { id: "menu-comida", label: "Menú Comida" },
  { id: "productos", label: "Productos" },
  { id: "fachada", label: "Nuestro Local" },
];

export default function Gallery({ images }: { images: GalleryImage[] }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  const filteredImages = activeCategory === "all" 
    ? images 
    : images.filter(img => img.category === activeCategory);

  const handleOpenImage = (img: GalleryImage) => {
    setSelectedImage(img);
    setZoomLevel(1);
  };

  const handleClose = () => {
    setSelectedImage(null);
    setZoomLevel(1);
  };

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.5, 3));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.5, 1));

  return (
    <div className="space-y-8">
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 md:gap-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full text-sm md:text-base font-medium transition-all duration-300 border",
              activeCategory === cat.id
                ? "bg-gradient-to-r from-orange-500 to-red-600 text-white border-transparent shadow-lg scale-105"
                : "bg-black/40 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredImages.map((img, index) => (
          <div 
            key={`${img.src}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-xl bg-gray-900 border border-white/10 cursor-pointer shadow-md hover:shadow-xl transition-all hover:scale-[1.02]"
            onClick={() => handleOpenImage(img)}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <Maximize2 className="text-white w-8 h-8 drop-shadow-md" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/90 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-white text-sm font-medium truncate">{img.alt}</p>
            </div>
          </div>
        ))}
      </div>

      {/* No Results */}
      {filteredImages.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <p>No hay imágenes disponibles en esta categoría.</p>
        </div>
      )}

      {/* Lightbox Modal */}
      <Dialog open={!!selectedImage} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="max-w-[95vw] md:max-w-[90vw] h-[90vh] p-0 bg-black/95 border-white/10 overflow-hidden flex flex-col">
           <DialogTitle className="sr-only">
            {selectedImage?.alt || "Imagen de galería"}
          </DialogTitle>
          {/* Toolbar */}
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            <Button variant="secondary" size="icon" onClick={handleZoomOut} className="bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm">
              <ZoomOut className="w-5 h-5" />
            </Button>
            <Button variant="secondary" size="icon" onClick={handleZoomIn} className="bg-black/50 hover:bg-black/80 text-white rounded-full backdrop-blur-sm">
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleClose} className="rounded-full shadow-lg">
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Image Container */}
          <div className="flex-1 w-full h-full relative flex items-center justify-center overflow-auto p-4 md:p-8">
            {selectedImage && (
              <div 
                className="relative transition-transform duration-300 ease-out"
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  cursor: zoomLevel > 1 ? "grab" : "default"
                }}
              >
                {/* Use img tag here for better control over natural size in lightbox, or Next Image with specific handling */}
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl"
                />
              </div>
            )}
          </div>
          
          {/* Footer Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md text-white text-center">
             <h3 className="text-lg font-semibold">{selectedImage?.alt}</h3>
             <p className="text-sm text-gray-400 capitalize">{selectedImage?.category.replace('-', ' ')}</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
