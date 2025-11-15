"use client";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const fetcher = (u: string) => fetch(u).then((r) => r.json());

export default function AdminUserDetailPage() {
  const params = useParams();
  const id = String(params?.id ?? "");
  const { data } = useSWR(id ? `/api/admin/users/detail?id=${id}` : null, fetcher);
  const progress = data?.progress;
  const attempts = data?.attempts ?? [];
  const promos = data?.promos ?? [];
  return (
    <div className="max-w-6xl mx-auto p-6 grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Usuario</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          <div>Nombre: {data?.user?.name}</div>
          <div>Email: {data?.user?.email}</div>
          <div>Rol: {data?.user?.role?.name ?? "USER"}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Progreso</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2">
          {progress && (
            <>
              <div className="text-sm">Juegos completados: {[progress.game1Completed,progress.game2Completed,progress.game3Completed,progress.game4Completed,progress.game5Completed].filter(Boolean).length}/5</div>
              <div className="w-full h-2 rounded bg-muted"><div className="h-2 bg-primary rounded" style={{ width: `${Math.round(([progress.game1Completed,progress.game2Completed,progress.game3Completed,progress.game4Completed,progress.game5Completed].filter(Boolean).length/5)*100)}%` }} /></div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intentos por día</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Juego</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Usados</TableHead>
                <TableHead>Límite</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {attempts.map((a: any) => (
                <TableRow key={a.id}>
                  <TableCell>{a.game}</TableCell>
                  <TableCell>{new Date(a.date).toLocaleDateString()}</TableCell>
                  <TableCell>{a.used}</TableCell>
                  <TableCell>{a.limit}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Premio</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promos.map((p: any) => (
                <TableRow key={p.id}>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.prizeType}</TableCell>
                  <TableCell>{p.redeemed ? "Canjeado" : "Pendiente"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
