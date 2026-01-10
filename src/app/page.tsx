import PromoFood from "@/components/site/PromoFood";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-black selection:bg-orange-500 selection:text-white">
      <main className="flex-1 flex flex-col">
        <PromoFood />
      </main>
    </div>
  );
}
