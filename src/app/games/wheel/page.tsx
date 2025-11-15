"use client";
import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressPrize from "@/components/site/ProgressPrize";
import { toast } from "sonner";

const Wheel: any = dynamic(() => import("react-custom-roulette").then((m) => (m as any).Wheel), { ssr: false }) as any;

export default function WheelPage() {
  const data = useMemo(() => [
    { option: "Gana", style: { backgroundColor: "#22c55e", textColor: "#111" } },
    { option: "Pierde", style: { backgroundColor: "#ef4444", textColor: "#fff" } },
    { option: "Pierde", style: { backgroundColor: "#ef4444", textColor: "#fff" } },
    { option: "Gana", style: { backgroundColor: "#22c55e", textColor: "#111" } },
    { option: "Pierde", style: { backgroundColor: "#ef4444", textColor: "#fff" } },
    { option: "Gana", style: { backgroundColor: "#22c55e", textColor: "#111" } },
  ], []);
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [result, setResult] = useState<string | null>(null);
  const handleSpinClick = () => {
    if (mustSpin) return;
    const newPrizeNumber = Math.floor(Math.random() * data.length);
    setPrizeNumber(newPrizeNumber);
    setMustSpin(true);
  };
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cómo funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Gira la ruleta. Si cae en “Gana” será una victoria para este reto.</p>
          <ProgressPrize />
        </CardContent>
      </Card>
      <div className="flex flex-col items-center gap-4">
        <Wheel
        mustStartSpinning={mustSpin}
        prizeNumber={prizeNumber}
        data={data}
        backgroundColors={["#0f172a", "#1e293b"]}
        textColors={["#fff"]}
        onStopSpinning={async () => {
          setMustSpin(false);
          const r = data[prizeNumber].option;
          setResult(r);
          const resp = await fetch("/api/games/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game: "wheel", win: r === "Gana" }) });
          if (!resp.ok) {
            const j = await resp.json().catch(() => ({}));
            toast.error(j.error ?? "Error en intento");
          }
        }}
        />
        <Button onClick={handleSpinClick}>Girar</Button>
        {result && <div>Resultado: {result}</div>}
      </div>
    </div>
  );
}
