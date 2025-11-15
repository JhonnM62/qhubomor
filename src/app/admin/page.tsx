"use client";
"use client";
import useSWR from "swr";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminPage() {
  const { data: users } = useSWR("/api/admin/users", fetcher);
  const { data: promos, mutate } = useSWR("/api/admin/promos", fetcher);
  const { data: roles } = useSWR("/api/admin/roles", fetcher);
  const { data: winners } = useSWR("/api/admin/bingo/winners", fetcher);
  const [selectedWinner, setSelectedWinner] = useState<any>(null);
  const [code, setCode] = useState("");
  const [roleChange, setRoleChange] = useState<Record<string, string>>({});

  const verify = async () => {
    const res = await fetch("/api/promocode/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    if (res.ok) mutate();
  };

  return (
    <div className="max-w-5xl mx-auto p-4 grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Verificar código</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Código" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button onClick={verify}>Verificar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users?.users?.map((u: any) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    <Select value={roleChange[u.email] ?? u.role?.name ?? "USER"} onValueChange={(v) => setRoleChange((s) => ({ ...s, [u.email]: v }))}>
                      <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {roles?.roles?.map((r: any) => (<SelectItem key={r.name} value={r.name}>{r.name}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Button size="sm" onClick={async () => {
                      const role = roleChange[u.email] ?? u.role?.name ?? "USER";
                      await fetch("/api/admin/roles", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email: u.email, role }) });
                      await Promise.all([mutate(), users && (users.mutate?.() ?? Promise.resolve())]);
                    }}>Guardar</Button>
                    <Button size="sm" variant="outline" className="ml-2" asChild>
                      <a href={`/admin/users/${u.id}`}>Ver detalle</a>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Promociones</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Premio</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Canjeado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {promos?.promos?.map((p: any) => (
                <TableRow key={p.code}>
                  <TableCell>{p.code}</TableCell>
                  <TableCell>{p.prizeType}</TableCell>
                  <TableCell>{p.user?.email}</TableCell>
                  <TableCell>{p.redeemed ? "Sí" : "No"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ganadores de BINGO</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Código</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Ver</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {winners?.winners?.map((w: any) => (
                <TableRow key={w.id}>
                  <TableCell>{w.nombre || w.user?.name}</TableCell>
                  <TableCell>{w.code}</TableCell>
                  <TableCell>{new Date(w.createdAt).toLocaleString()}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => setSelectedWinner(w)}>Detalle</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      {selectedWinner && (
        <Card>
          <CardHeader>
            <CardTitle>Detalle de ganador</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <div>Nombre: {selectedWinner?.nombre || selectedWinner?.user?.name}</div>
            <div>Cédula: {selectedWinner?.cedula || ""}</div>
            <div>Teléfono: {selectedWinner?.telefono || ""}</div>
            <div>Dirección: {selectedWinner?.direccion || ""}</div>
            <div>Mayor de edad: {selectedWinner?.edadConfirmada ? "Sí" : "No"}</div>
            <div>Código: {selectedWinner?.code}</div>
            {selectedWinner?.promoCode?.qrData && (
              <div className="mt-2">
                <img alt="QR" src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(selectedWinner.promoCode.qrData)}`} />
              </div>
            )}
            {selectedWinner?.cardPhotoPath && (
              <div className="mt-2">
                <img alt="Tarjeta" src={selectedWinner.cardPhotoPath} width={200} height={200} />
              </div>
            )}
            <div className="mt-4">
              <div className="grid grid-cols-5 gap-1 mb-1">
                {["B","I","N","G","O"].map((h) => (
                  <div key={h} className="h-8 w-10 flex items-center justify-center rounded bg-accent text-accent-foreground font-bold">{h}</div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {(selectedWinner?.board ? JSON.parse(selectedWinner.board) : []).map((row: number[], ri: number) => row.map((n: number, ci: number) => {
                  const calls: number[] = selectedWinner?.calls ? JSON.parse(selectedWinner.calls) : [];
                  const called = n === 0 || calls.includes(n);
                  return (
                    <div key={`${ri}-${ci}`} className={`h-10 w-10 flex items-center justify-center rounded border text-sm ${called ? "bg-primary text-primary-foreground" : "bg-card"}`}>{n === 0 ? "★" : n}</div>
                  );
                }))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
