"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function AdminWinnerDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const { data } = useSWR(id ? `/api/admin/bingo/winners/detail?id=${id}` : null, fetcher);
  const w = data?.winner;
  const board: number[][] = w?.board ? JSON.parse(w.board) : [];
  const calls: number[] = w?.calls ? JSON.parse(w.calls) : [];
  return (
    <div className="max-w-6xl mx-auto p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Ganador</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div>Nombre: {w?.nombre || w?.user?.name}</div>
          <div>Cédula: {w?.cedula || ""}</div>
          <div>Teléfono: {w?.telefono || ""}</div>
          <div>Dirección: {w?.direccion || ""}</div>
          <div>Mayor de edad: {w?.edadConfirmada ? "Sí" : "No"}</div>
          <div>Código: {w?.code}</div>
          {w?.promoCode?.qrData && (
            <div className="mt-2">
              <img alt="QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(w.promoCode.qrData)}`} />
            </div>
          )}
          {w?.cardPhotoPath && (
            <div className="mt-2">
              <Image src={w.cardPhotoPath} alt="Tarjeta" width={200} height={200} />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tabla del jugador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-max mx-auto">
            <div className="grid grid-cols-5 gap-1 mb-1">
              {["B","I","N","G","O"].map((h) => (
                <div key={h} className="h-8 w-10 flex items-center justify-center rounded bg-accent text-accent-foreground font-bold">{h}</div>
              ))}
            </div>
            <div className="grid grid-cols-5 gap-1">
              {board.map((row: number[], ri: number) => row.map((n: number, ci: number) => {
                const called = n === 0 || calls.includes(n);
                return (
                  <div key={`${ri}-${ci}`} className={`h-10 w-10 flex items-center justify-center rounded border text-sm ${called ? "bg-primary text-primary-foreground" : "bg-card"}`}>{n === 0 ? "★" : n}</div>
                );
              }))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
