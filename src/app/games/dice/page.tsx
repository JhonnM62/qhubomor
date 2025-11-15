"use client";
import dynamic from "next/dynamic";
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressPrize from "@/components/site/ProgressPrize";
import { toast } from "sonner";

const ReactDice = dynamic(() => import("react-dice-complete").then((m) => m.default), { ssr: false });

export default function DicePage() {
  const diceRef = useRef<any>(null);
  const roll = () => diceRef.current?.rollAll?.();
  const rollDone = (totalValue: number, values: number[]) => {
    const v = values?.[0] ?? totalValue;
    fetch("/api/games/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game: "dice", win: v >= 4 }) }).then(async (r) => {
      if (!r.ok) {
        const j = await r.json().catch(() => ({}));
        toast.error(j.error ?? "Error en intento");
      }
    });
  };
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cómo funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Tira el dado. Si obtienes 4 o más se considera victoria para este reto.</p>
          <ProgressPrize />
        </CardContent>
      </Card>
      <div className="flex flex-col items-center gap-4">
        {/* @ts-ignore */}
        <ReactDice numDice={1} ref={diceRef} rollDone={rollDone} dieSize={80} faceColor="#fff" dotColor="#111" />
        <Button onClick={roll}>Tirar</Button>
      </div>
    </div>
  );
}
