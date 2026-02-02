import Hero from "@/components/site/Hero";
import ProductShowcase from "@/components/site/ProductShowcase";
import LocationSection from "@/components/site/LocationSection";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-black selection:bg-orange-500 selection:text-white">
      <main className="flex-1 flex flex-col">
        <Hero />
        <ProductShowcase />
        <LocationSection />
      </main>
    </div>
  );
}
