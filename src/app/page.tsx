import Promo2x1 from "@/components/site/Promo2x1";

export default function Home() {
  return (
    <div className="relative min-h-screen flex flex-col bg-black selection:bg-pink-500 selection:text-white">
      <main className="flex-1 flex flex-col">
        <Promo2x1 />
      </main>
    </div>
  );
}
