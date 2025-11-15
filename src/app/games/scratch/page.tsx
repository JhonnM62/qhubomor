"use client";
import dynamic from "next/dynamic";
import { useMemo, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressPrize from "@/components/site/ProgressPrize";
import { toast } from "sonner";

const ScratchCard = dynamic(() => import("next-scratchcard").then((m) => m.ScratchCard), { ssr: false });

export default function ScratchPage() {
  const win = useMemo(() => Math.random() < 0.5, []);
  const ref = useRef<any>(null);
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cómo funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Rasca la tarjeta hasta revelar el contenido. En este reto, el premio se decide al azar.</p>
          <ProgressPrize />
        </CardContent>
      </Card>
      
      {/* @ts-ignore */}
      <ScratchCard finishPercent={40} brushSize={20} onComplete={async () => {
        const resp = await fetch("/api/games/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game: "scratch", win }) });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          toast.error(j.error ?? "Error en intento");
        }
      }}>
        <div className="w-[300px] h-[180px] flex items-center justify-center rounded-md border bg-card">
          <div className="text-xl font-semibold">{win ? "Premio" : "Sigue intentando"}</div>
        </div>
      </ScratchCard>
      <Button variant="outline" onClick={() => ref.current?.reset?.()}>Reintentar</Button>
    </div>
  );
}
