"use client";
import { useBingo } from "@/components/providers/BingoProvider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import useSWR from "swr";
import { FaCalendarAlt, FaUsers, FaTicketAlt, FaGlassCheers } from "react-icons/fa";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function BingoLobby({ pot, eventDate }: { pot: number; eventDate: string }) {
  const { players } = useBingo();
  const { status } = useSession();
  const { data } = useSWR("/api/public/users", fetcher);
  const registered = (data?.users ?? []).filter((u: any) => (u.role?.name ?? "USER") !== "ADMIN");
  const participants = registered.length > 0 ? registered : players.filter((p) => (p.role ?? "USER") !== "ADMIN");
  const potText = new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(pot);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FaGlassCheers size={24} className="text-primary" />
          Gran BINGO — Potencia tus premios
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="rounded border p-3 flex items-center gap-2">
            <FaCalendarAlt size={24} className="text-primary" />
            <div className="text-sm">Fecha: <span className="font-medium">{new Date(eventDate).toLocaleDateString("es-CO")}</span></div>
          </div>
          <div className="rounded border p-3 flex items-center gap-2">
            <FaTicketAlt size={24} className="text-primary" />
            <div className="text-sm">Bote inicial: <span className="font-medium">{potText}</span></div>
          </div>
          <div className="rounded border p-3 flex items-center gap-2">
            <FaUsers size={24} className="text-primary" />
            <div className="text-sm">Cada compra suma <span className="font-medium">$2.000</span> al bote</div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Participantes registrados</div>
          <div className="flex flex-wrap gap-3">
            {participants.slice(0, 24).map((p: any) => (
              <div key={p.id} className="flex items-center gap-2 rounded-full border px-2 py-1">
                <div className="relative h-6 w-6 rounded-full overflow-hidden border">
                  {p.image && <Image src={p.image} alt="avatar" fill />}
                </div>
                <div className="text-xs font-medium truncate max-w-[8rem]">{p.name}</div>
              </div>
            ))}
          </div>
        </div>
        {status !== "authenticated" && (
          <div className="text-sm text-muted-foreground">
            Inicia sesión para participar. <Link href="/login" className="underline">Acceder</Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
