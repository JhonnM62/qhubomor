"use client";
import useSWR from "swr";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function AdminDashboard() {
  const { data: users } = useSWR("/api/admin/users", fetcher);
  const { data: promos } = useSWR("/api/admin/promos", fetcher);
  const { data: cfg, mutate: mutateCfg } = useSWR("/api/admin/bingo/config", fetcher);
  const [startAt, setStartAt] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  useEffect(() => {
    const s = io({ path: "/api/bingo/socket" });
    s.on("prepare", (payload: { startAt: number }) => {
      setStartAt(payload.startAt);
    });
    s.on("started", () => {
      setStartAt(null);
      setCountdown(null);
    });
    return () => { s.disconnect(); };
  }, []);
  useEffect(() => {
    if (!startAt) return;
    const update = () => {
      const remaining = Math.max(0, startAt - Date.now());
      setCountdown(Math.ceil(remaining / 1000));
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, [startAt]);
  return (
    <div className="max-w-6xl mx-auto p-3 md:p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Métricas</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          <div className="rounded border p-3">
            <div className="text-xs text-muted-foreground">Usuarios</div>
            <div className="text-2xl font-bold">{users?.users?.length ?? 0}</div>
          </div>
          <div className="rounded border p-3">
            <div className="text-xs text-muted-foreground">Promos</div>
            <div className="text-2xl font-bold">{promos?.promos?.length ?? 0}</div>
          </div>
          <div className="rounded border p-3">
            <div className="text-xs text-muted-foreground">Duración ronda (s)</div>
            <div className="text-2xl font-bold">{cfg?.config?.roundDuration ?? 0}</div>
          </div>
          <div className="rounded border p-3">
            <div className="text-xs text-muted-foreground">Cuenta regresiva</div>
            <div className="text-2xl font-bold">{countdown !== null ? `${Math.floor((countdown ?? 0)/60)}:${String((countdown ?? 0)%60).padStart(2,'0')}` : "—"}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Config Bingo</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-2">
          <Input id="balls" defaultValue={cfg?.config?.ballsNumber ?? 75} className="w-24" />
          <Input id="duration" defaultValue={cfg?.config?.roundDuration ?? 300} className="w-32" />
          <Button onClick={async () => {
            const balls = Number((document.getElementById("balls") as HTMLInputElement).value || 75);
            const duration = Number((document.getElementById("duration") as HTMLInputElement).value || 300);
            await fetch("/api/admin/bingo/config", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ballsNumber: balls, roundDuration: duration }) });
            mutateCfg();
          }}>Guardar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actividad recientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Promos</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.users?.slice(0,10).map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{(promos?.promos?.filter((p: any) => p.user?.id === u.id).length) ?? 0}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
