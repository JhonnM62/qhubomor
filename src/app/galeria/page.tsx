import { getGalleryImages } from "@/lib/gallery-data";
import Gallery from "@/components/site/Gallery";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Galería - Menús y Fotos | Q'hubo Mor",
  description: "Explora nuestros menús de granizados y comida, conoce nuestros productos y echa un vistazo a nuestro local en Ipiales.",
};

export default async function GalleryPage() {
  const images = await getGalleryImages();

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 space-y-4">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600">
            Nuestra Galería
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Descubre nuestros deliciosos granizados, comida y el ambiente único de Q'hubo Mor.
          </p>
        </div>
        
        <Gallery images={images} />
      </div>
    </div>
  );
}
