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
    <div className="max-w-6xl mx-auto p-4 md:p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 relative rounded-full overflow-hidden border shrink-0">
            {data?.user?.image && <Image src={data.user.image} alt="avatar" fill className="object-cover" />}
          </div>
          <div className="space-y-4 w-full text-center md:text-left">
            <div className="text-sm font-medium">
              <p className="text-lg font-bold">{data?.user?.name}</p>
              <p className="text-muted-foreground">{data?.user?.email}</p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Input 
                  type="file" 
                  accept="image/*" 
                  className="max-w-[200px]"
                  onChange={(e) => { 
                    const f = e.target.files?.[0]; 
                    if (f) { 
                      setPreview(URL.createObjectURL(f)); 
                      uploadPhoto(f); 
                    } 
                  }} 
                />
                {preview && <Image src={preview} alt="preview" width={40} height={40} className="rounded object-cover" />}
              </div>
              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <Button variant="outline" onClick={backup} className="flex-1 sm:flex-none">Backup</Button>
                <Button variant="secondary" onClick={() => signOut({ callbackUrl: "/" })} className="flex-1 sm:flex-none">Salir</Button>
              </div>
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
            <div className="space-y-4 text-center md:text-left">
              <div className="text-sm text-muted-foreground">Aún no has subido capturas. Necesitas comprobar 3 redes: Facebook, Instagram y TikTok.</div>
              <Button asChild className="w-full md:w-auto">
                <Link href="/claim">Verificar redes y generar código</Link>
              </Button>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {["FACEBOOK","INSTAGRAM","TIKTOK"].map((plat) => (
                  <div key={plat} className="rounded border p-3 bg-muted/50">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{plat}</span>
                      <Badge variant="secondary">Pendiente</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {["FACEBOOK","INSTAGRAM","TIKTOK"].map((plat) => {
                const p = data.proofs.find((x: any) => x.platform === plat);
                const verified = !!p;
                return (
                  <div key={plat} className="space-y-3 rounded-lg border p-4 bg-card text-card-foreground shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">{plat}</span>
                      <Badge variant={verified ? "default" : "secondary"}>{verified ? "Verificada" : "Pendiente"}</Badge>
                    </div>
                    {p?.screenshotPath ? (
                      <div className="relative aspect-video w-full overflow-hidden rounded-md border">
                        <Image src={p.screenshotPath} alt="captura" fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex h-[120px] items-center justify-center rounded-md border border-dashed bg-muted/50">
                        <span className="text-xs text-muted-foreground">Sin captura</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Panel de progreso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Juegos completados</span>
                <span className="font-medium">{gamesDone}/5</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-secondary">
                <div className="h-2.5 rounded-full bg-primary transition-all" style={{ width: `${Math.round((gamesDone / 5) * 100)}%` }} />
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Redes verificadas</span>
                <span className="font-medium">{data?.proofs?.length ?? 0}/3</span>
              </div>
              <div className="h-2.5 w-full rounded-full bg-secondary">
                <div className="h-2.5 rounded-full bg-primary transition-all" style={{ width: `${Math.round(((data?.proofs?.length ?? 0) / 3) * 100)}%` }} />
              </div>
            </div>

            <div className="pt-2">
              <Button onClick={generate} disabled={!canGenerate} className="w-full">
                Generar código y QR
              </Button>
              {!canGenerate && (
                <p className="mt-2 text-center text-xs text-muted-foreground">
                  Completa 5/5 juegos y verifica 3/3 redes para canjear.
                </p>
              )}
            </div>

            {promo && (
              <div className="mt-4 rounded-lg border p-4 bg-muted/30 flex flex-col items-center text-center space-y-3">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider">Tu Código</div>
                  <div className="text-2xl font-bold text-primary tracking-widest">{promo.code}</div>
                  <div className="text-sm font-medium mt-1">{promo.prizeType}</div>
                </div>
                <div className="p-2 bg-white rounded-lg shadow-sm">
                  <QRCodeCanvas value={JSON.stringify({ code: promo.code, prizeType: promo.prizeType })} size={160} />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Historial de logros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data?.promos?.map((p: any) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/20">
                  <div className="flex flex-col">
                    <span className="font-mono font-bold text-sm">{p.code}</span>
                    <span className="text-xs text-muted-foreground">{p.prizeType}</span>
                  </div>
                  <Badge variant={p.redeemed ? "secondary" : "outline"} className={p.redeemed ? "" : "border-primary text-primary"}>
                    {p.redeemed ? "Canjeado" : "Pendiente"}
                  </Badge>
                </div>
              ))}
              {(!data?.promos || data.promos.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Aún no tienes logros.</p>
                  <p className="text-xs mt-1">¡Juega y gana premios!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
