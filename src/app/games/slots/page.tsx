"use client";
import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressPrize from "@/components/site/ProgressPrize";
import { toast } from "sonner";

const Slot = dynamic(() => import("react-slot-machine"), { ssr: false });

const icons = ["🍒", "🍋", "⭐", "🔔", "7️⃣"];

export default function SlotsPage() {
  const [targets, setTargets] = useState([0, 0, 0]);
  const finished = useRef([false, false, false]);
  const items = useMemo(() => icons.map((sym) => (
    <div key={sym} style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48 }}>
      {sym}
    </div>
  )), []);

  const onEnd = useCallback((index: number) => {
    finished.current[index] = true;
    if (finished.current.every(Boolean)) {
      finished.current = [false, false, false];
      const resultSyms = targets.map((t) => icons[t]);
      const counts = resultSyms.reduce<Record<string, number>>((acc, cur) => { acc[cur] = (acc[cur] ?? 0) + 1; return acc; }, {});
      const win = Object.values(counts).some((c) => c >= 2);
      fetch("/api/games/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game: "slots", win }) }).then(async (r) => {
        if (!r.ok) {
          const j = await r.json().catch(() => ({}));
          toast.error(j.error ?? "Error en intento");
        }
      });
    }
  }, [targets]);

  const spin = () => {
    const next = [0, 0, 0].map(() => Math.floor(Math.random() * icons.length));
    setTargets(next);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Cómo funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Gira los rodillos. Si obtienes al menos 2 símbolos iguales, cuentas como victoria.</p>
          <ProgressPrize />
        </CardContent>
      </Card>
      <div className="flex gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} style={{ width: 120, height: 120 }}>
            {/* @ts-ignore */}
            <Slot target={targets[i]} duration={1200} times={3} onEnd={() => onEnd(i)}>
              {items}
            </Slot>
          </div>
        ))}
      </div>
      <Button onClick={spin}>Girar</Button>
    </div>
  );
}
