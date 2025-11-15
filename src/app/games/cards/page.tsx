"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card as UICard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProgressPrize from "@/components/site/ProgressPrize";
import { toast } from "sonner";

type Card = { id: number; value: string; flipped: boolean; matched: boolean };

export default function CardsPage() {
  const base = ["A", "B", "C"].flatMap((v, i) => [{ id: i*2, value: v, flipped: false, matched: false }, { id: i*2+1, value: v, flipped: false, matched: false }]);
  const [cards, setCards] = useState<Card[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  useEffect(() => {
    setCards([...base].sort(() => Math.random() - 0.5));
  }, []);
  const flip = async (idx: number) => {
    const next = cards.slice();
    if (next[idx].flipped || next[idx].matched) return;
    next[idx].flipped = true;
    const sel = [...selected, idx];
    setCards(next);
    setSelected(sel);
    if (sel.length === 2) {
      const [a, b] = sel;
      if (next[a].value === next[b].value) {
        next[a].matched = true; next[b].matched = true;
      } else {
        setTimeout(() => {
          const n2 = next.slice();
          n2[a].flipped = false; n2[b].flipped = false;
          setCards(n2);
        }, 600);
      }
      setSelected([]);
      setCards(next);
      if (next.every((c) => c.matched)) {
        const resp = await fetch("/api/games/progress", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ game: "cards", win: true }) });
        if (!resp.ok) {
          const j = await resp.json().catch(() => ({}));
          toast.error(j.error ?? "Error en intento");
        }
      }
    }
  };
  return (
    <div className="p-6 space-y-6">
      <UICard>
        <CardHeader>
          <CardTitle>Cómo funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Encuentra las parejas. Al emparejar todas las cartas, cuentas como victoria.</p>
          <ProgressPrize />
        </CardContent>
      </UICard>
      <div className="grid grid-cols-3 gap-2">
        {cards.map((c, i) => (
          <Button key={c.id} variant={c.flipped || c.matched ? "default" : "secondary"} onClick={() => flip(i)}>{c.flipped || c.matched ? c.value : "?"}</Button>
        ))}
      </div>
    </div>
  );
}
