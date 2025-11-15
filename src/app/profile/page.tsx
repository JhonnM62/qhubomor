"use client";
import useSWR from "swr";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { QRCodeCanvas } from "qrcode.react";
import { signOut } from "next-auth/react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProfilePage() {
  const { data, mutate } = useSWR("/api/profile/summary", fetcher);
  const [preview, setPreview] = useState<string | null>(null);
  const evtRef = useRef<EventSource | null>(null);
  useEffect(() => {
    evtRef.current?.close();
    const es = new EventSource("/api/progress/stream");
    es.onmessage = () => mutate();
    evtRef.current = es;
    return () => es.close();
  }, [mutate]);

  const uploadPhoto = async (file?: File) => {
    if (!file) return;
    const b64 = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); });
    await fetch("/api/profile/photo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ imageBase64: b64 }) });
    mutate();
  };

  const backup = async () => {
    await fetch("/api/profile/backup", { method: "POST" });
  };

  const gamesDone = data?.progress ? [data.progress.game1Completed, data.progress.game2Completed, data.progress.game3Completed, data.progress.game4Completed, data.progress.game5Completed].filter(Boolean).length : 0;
  const [promo, setPromo] = useState<any>(null);
  const canGenerate = (gamesDone === 5) && ((data?.proofs?.length ?? 0) >= 3);
  const generate = async () => {
    const res = await fetch("/api/promocode/generate", { method: "POST" });
    const j = await res.json();
    if (res.ok) setPromo(j.promo);
    mutate();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <div className="w-24 h-24 relative rounded-full overflow-hidden border">
            {data?.user?.image && <Image src={data.user.image} alt="avatar" fill />}
          </div>
          <div className="space-y-2">
            <div className="text-sm">{data?.user?.name} · {data?.user?.email}</div>
            <div className="flex items-center gap-2">
              <Input type="file" accept="image/*" onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPreview(URL.createObjectURL(f)); uploadPhoto(f); } }} />
              {preview && <Image src={preview} alt="preview" width={48} height={48} className="rounded" />}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={backup}>Backup progreso</Button>
              <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })}>Cerrar sesión</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Verificación de redes sociales</CardTitle>
        </CardHeader>
        <CardContent>
          {(!data?.proofs || data.proofs.length === 0) ? (
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Aún no has subido capturas. Necesitas comprobar 3 redes: Facebook, Instagram y TikTok.</div>
              <Button asChild>
                <Link href="/claim">Verificar redes y generar código</Link>
              </Button>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {["FACEBOOK","INSTAGRAM","TIKTOK"].map((plat) => (
                  <div key={plat} className="rounded border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{plat}</span>
                      <Badge variant="secondary">Pendiente</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {["FACEBOOK","INSTAGRAM","TIKTOK"].map((plat) => {
                const p = data.proofs.find((x: any) => x.platform === plat);
                const verified = !!p;
                return (
                  <div key={plat} className="space-y-2 rounded border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{plat}</span>
                      <Badge variant={verified ? "default" : "secondary"}>{verified ? "Verificada" : "Pendiente"}</Badge>
                    </div>
                    {p?.screenshotPath ? (
                      <Image src={p.screenshotPath} alt="captura" width={180} height={120} className="rounded border" />
                    ) : (
                      <div className="text-xs text-muted-foreground">Sin captura</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Panel de progreso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">Juegos completados: {gamesDone}/5</div>
          <div className="w-full h-2 rounded bg-muted">
            <div className="h-2 bg-primary rounded" style={{ width: `${Math.round((gamesDone / 5) * 100)}%` }} />
          </div>
          <div className="text-sm">Redes verificadas: {data?.proofs?.length ?? 0}/3</div>
          <div className="w-full h-2 rounded bg-muted">
            <div className="h-2 bg-primary rounded" style={{ width: `${Math.round(((data?.proofs?.length ?? 0) / 3) * 100)}%` }} />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button onClick={generate} disabled={!canGenerate}>Generar código y QR</Button>
            {!canGenerate && <span className="text-xs text-muted-foreground">Completa 5/5 juegos y verifica 3/3 redes.</span>}
          </div>
          {promo && (
            <div className="pt-4 space-y-2">
              <div className="text-sm font-medium">Código: {promo.code} · Premio: {promo.prizeType}</div>
              <QRCodeCanvas value={JSON.stringify({ code: promo.code, prizeType: promo.prizeType })} size={180} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Historial de logros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm">
            {data?.promos?.map((p: any) => (
              <div key={p.id} className="flex items-center justify-between">
                <span>{p.code} · {p.prizeType}</span>
                <span className="text-xs text-muted-foreground">{p.redeemed ? "Canjeado" : "Pendiente"}</span>
              </div>
            ))}
            {(!data?.promos || data.promos.length === 0) && <div className="text-muted-foreground">Sin logros aún</div>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
