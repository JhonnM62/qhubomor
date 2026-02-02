"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { GalleryImage } from "@/lib/gallery-data";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, X, Maximize2, ChevronLeft, ChevronRight } from "lucide-react";
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
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const filteredImages = activeCategory === "all" 
    ? images 
    : images.filter(img => img.category === activeCategory);

  const currentIndex = selectedImage 
    ? filteredImages.findIndex(img => img.src === selectedImage.src)
    : -1;

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

  const handleNext = useCallback(() => {
    if (currentIndex === -1) return;
    const nextIndex = (currentIndex + 1) % filteredImages.length;
    setSelectedImage(filteredImages[nextIndex]);
    setZoomLevel(1);
  }, [currentIndex, filteredImages]);

  const handlePrev = useCallback(() => {
    if (currentIndex === -1) return;
    const prevIndex = (currentIndex - 1 + filteredImages.length) % filteredImages.length;
    setSelectedImage(filteredImages[prevIndex]);
    setZoomLevel(1);
  }, [currentIndex, filteredImages]);

  // Keyboard navigation
  useEffect(() => {
    if (!selectedImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "Escape") handleClose();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImage, handleNext, handlePrev]);

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Only swipe if zoom level is 1 (to avoid conflict with panning zoomed image)
    if (zoomLevel === 1) {
      if (isLeftSwipe) handleNext();
      if (isRightSwipe) handlePrev();
    }
  };

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
        {/* Pass showCloseButton={false} to custom DialogContent if supported, or rely on overriding styles */}
        <DialogContent 
          className="max-w-[95vw] md:max-w-[90vw] h-[90vh] p-0 bg-black/95 border-white/10 overflow-hidden flex flex-col [&>button]:hidden"
        >
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

          {/* Navigation Buttons (Desktop & Mobile) */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handlePrev}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-black/50 rounded-full w-12 h-12 hidden md:flex"
          >
            <ChevronLeft className="w-8 h-8" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleNext}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-black/50 rounded-full w-12 h-12 hidden md:flex"
          >
            <ChevronRight className="w-8 h-8" />
          </Button>

          {/* Image Container with Swipe Handlers */}
          <div 
            className="flex-1 w-full h-full relative flex items-center justify-center overflow-hidden p-0 md:p-8"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {selectedImage && (
              <div 
                className="relative transition-transform duration-300 ease-out select-none"
                style={{ 
                  transform: `scale(${zoomLevel})`,
                  cursor: zoomLevel > 1 ? "grab" : "default"
                }}
              >
                {/* Use img tag here for better control over natural size in lightbox */}
                <img
                  src={selectedImage.src}
                  alt={selectedImage.alt}
                  className="max-w-full max-h-[85vh] object-contain rounded-md shadow-2xl pointer-events-none" // pointer-events-none to prevent drag conflict with swipe
                />
              </div>
            )}
            
            {/* Mobile Navigation Hints (Visible only on touch/mobile if needed, or overlay arrows) */}
            <div className="absolute inset-y-0 left-0 w-16 z-40 md:hidden flex items-center justify-start pl-2" onClick={handlePrev}>
               <div className="bg-black/20 p-1 rounded-full text-white/70 backdrop-blur-sm">
                 <ChevronLeft className="w-6 h-6" />
               </div>
            </div>
            <div className="absolute inset-y-0 right-0 w-16 z-40 md:hidden flex items-center justify-end pr-2" onClick={handleNext}>
               <div className="bg-black/20 p-1 rounded-full text-white/70 backdrop-blur-sm">
                 <ChevronRight className="w-6 h-6" />
               </div>
            </div>
          </div>
          
          {/* Footer Info */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/80 backdrop-blur-md text-white text-center z-50">
             <h3 className="text-lg font-semibold">{selectedImage?.alt}</h3>
             <p className="text-sm text-gray-400 capitalize">{selectedImage?.category.replace('-', ' ')}</p>
             <p className="text-xs text-gray-500 mt-1 md:hidden">Desliza para ver más</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
