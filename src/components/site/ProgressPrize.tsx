"use client";
import { useEffect, useState } from "react";

type Status = {
  gamesCompleted: number;
  totalGames: number;
  socialProofs: number;
  totalProofs: number;
  overall: number;
  remainingOverall: number;
};

function Bar({ value }: { value: number }) {
  return (
    <div className="w-full h-2 rounded-full bg-muted">
      <div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export default function ProgressPrize() {
  const [status, setStatus] = useState<Status | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/games/status").then(async (r) => {
      if (!r.ok) return;
      const j = await r.json();
      if (active) setStatus(j);
    });
    return () => { active = false; };
  }, []);

  const gamesPct = status ? Math.round((status.gamesCompleted / status.totalGames) * 100) : 0;
  const proofsPct = status ? Math.round((status.socialProofs / status.totalProofs) * 100) : 0;
  const overall = status?.overall ?? 0;

  return (
    <div className="w-full space-y-3">
      <div className="flex items-center justify-between text-sm">
        <span>Progreso juegos ({status?.gamesCompleted ?? 0}/{status?.totalGames ?? 5})</span>
        <span>{gamesPct}%</span>
      </div>
      <Bar value={gamesPct} />
      <div className="flex items-center justify-between text-sm">
        <span>Redes verificadas ({status?.socialProofs ?? 0}/{status?.totalProofs ?? 3})</span>
        <span>{proofsPct}%</span>
      </div>
      <Bar value={proofsPct} />
      <div className="flex items-center justify-between text-sm font-medium">
        <span>Listo para premio</span>
        <span>{overall}%</span>
      </div>
      <Bar value={overall} />
      <div className="text-xs text-muted-foreground">Restante: {status?.remainingOverall ?? 100}%</div>
    </div>
  );
}
