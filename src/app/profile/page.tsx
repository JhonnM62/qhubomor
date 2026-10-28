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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Trash2, AlertTriangle, RefreshCw } from "lucide-react";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function ProfilePage() {
  const { data, mutate } = useSWR("/api/profile/summary", fetcher);
  const [preview, setPreview] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
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

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true);
      const res = await fetch("/api/profile/delete-account", {
        method: "POST",
      });
      const resData = await res.json();
      if (!res.ok) {
        throw new Error(resData.error || "No se pudo eliminar la cuenta");
      }

      if (typeof window !== "undefined") {
        localStorage.removeItem("qhubomor_fidelidad_id");
        localStorage.removeItem("qhubomor_mision_google_done");
        localStorage.removeItem("qhubomor_mision_social_done");
      }

      toast.success("Tu cuenta y sellos han sido eliminados correctamente.");
      setShowDeleteModal(false);
      await signOut({ callbackUrl: "/" });
    } catch (err: any) {
      toast.error(err.message || "Error al eliminar la cuenta");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row items-center gap-6">
          <Avatar className="w-24 h-24 rounded-full border-2 border-amber-500/40 shadow-xl shadow-amber-500/10 shrink-0 text-3xl font-black bg-zinc-900 text-amber-400">
            <AvatarImage
              src={preview || data?.user?.image || undefined}
              alt={data?.user?.name || "avatar"}
              className="object-cover w-full h-full"
            />
            <AvatarFallback className="bg-amber-500/20 text-amber-400 font-extrabold text-3xl flex items-center justify-center w-full h-full">
              {(data?.user?.name || "U")[0]?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
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

      {/* Zona de Peligro: Eliminar Cuenta */}
      <Card className="border-red-500/30 bg-red-950/10">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2 text-base">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <span>Zona de Peligro</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-white">Eliminar mi cuenta y sellos de fidelidad</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                Al eliminar tu cuenta se borrarán permanentemente tus sellos acumulados, tu tarjeta digital y tu perfil de cliente en el sistema del restaurante. Tus compras registradas se conservarán intactas para fines fiscales y contables. Esta acción no se puede deshacer.
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-bold shrink-0 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar Cuenta</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Confirmación para Eliminar Cuenta */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-red-500/40 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl shadow-red-500/10">
            <div className="flex items-center gap-3 text-red-500">
              <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">¿Eliminar cuenta definitivamente?</h3>
                <span className="text-xs text-red-400 font-medium">Esta acción no se puede deshacer</span>
              </div>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              Estás a punto de borrar tu cuenta de usuario, tus sellos acumulados y tu tarjeta digital de cliente en el sistema POS del restaurante.
              <br /><br />
              <strong className="text-amber-400">Nota de seguridad:</strong> El historial de ventas y compras del restaurante permanecerá seguro y contabilizado.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-900"
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 font-bold flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Eliminando...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Sí, eliminar mi cuenta</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
