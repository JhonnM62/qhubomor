"use client";
import useSWR from "swr";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function AdminPage() {
  const { data: users } = useSWR("/api/admin/users", fetcher);
  const { data: promos, mutate } = useSWR("/api/admin/promos", fetcher);
  const { data: roles } = useSWR("/api/admin/roles", fetcher);
  const { data: winners } = useSWR("/api/admin/bingo/winners", fetcher);
  const { data: reviews, mutate: mutateReviews } = useSWR<any[]>("/api/reviews", fetcher);
  const [selectedWinner, setSelectedWinner] = useState<any>(null);
  const [code, setCode] = useState("");
  const [roleChange, setRoleChange] = useState<Record<string, string>>({});
  const [reviewSearch, setReviewSearch] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState<number | null>(null);

  const verify = async () => {
    const res = await fetch("/api/promocode/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
    if (res.ok) mutate();
  };

  const handleDeleteReview = async (id: number) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta opinión permanentemente?")) return;
    setDeletingReviewId(id);
    try {
      const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Opinión eliminada correctamente");
        mutateReviews();
      } else {
        toast.error("Error al eliminar la opinión");
      }
    } catch {
      toast.error("Error de conexión al eliminar la opinión");
    } finally {
      setDeletingReviewId(null);
    }
  };

  const filteredReviews = (reviews || []).filter((r: any) => {
    const query = reviewSearch.toLowerCase();
    const userName = (r.user?.name || "").toLowerCase();
    const userEmail = (r.user?.email || "").toLowerCase();
    const title = (r.title || "").toLowerCase();
    const content = (r.content || "").toLowerCase();
    return userName.includes(query) || userEmail.includes(query) || title.includes(query) || content.includes(query);
  });

  return (
    <div className="max-w-6xl mx-auto p-3 md:p-4 grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Verificar código</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-2">
          <Input placeholder="Código" value={code} onChange={(e) => setCode(e.target.value)} />
          <Button onClick={verify}>Verificar</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuarios</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
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
        <CardContent className="overflow-x-auto">
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
        <CardContent className="overflow-x-auto">
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
          <CardContent className="grid gap-2 text-xs md:text-sm">
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
                  <div key={h} className="h-7 w-8 md:h-8 md:w-10 flex items-center justify-center rounded bg-accent text-accent-foreground font-bold text-xs md:text-sm">{h}</div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {(selectedWinner?.board ? JSON.parse(selectedWinner.board) : []).map((row: number[], ri: number) => row.map((n: number, ci: number) => {
                  const calls: number[] = selectedWinner?.calls ? JSON.parse(selectedWinner.calls) : [];
                  const called = n === 0 || calls.includes(n);
                  return (
                    <div key={`${ri}-${ci}`} className={`h-8 w-8 md:h-10 md:w-10 flex items-center justify-center rounded border text-xs md:text-sm ${called ? "bg-primary text-primary-foreground" : "bg-card"}`}>{n === 0 ? "★" : n}</div>
                  );
                }))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              Gestión de Opiniones de Clientes (Reviews)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Supervisa y administra las opiniones públicas. Total: {reviews?.length ?? 0} opiniones
            </p>
          </div>
          <div className="flex items-center gap-2 max-w-xs w-full">
            <Input
              placeholder="Buscar por cliente, email o texto..."
              value={reviewSearch}
              onChange={(e) => setReviewSearch(e.target.value)}
              className="text-xs"
            />
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {!reviews ? (
            <div className="py-6 text-center text-sm text-muted-foreground">Cargando opiniones...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {reviewSearch ? "No se encontraron opiniones que coincidan con la búsqueda." : "No hay opiniones de clientes registradas aún."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Calificación</TableHead>
                  <TableHead className="min-w-[280px]">Opinión (Título y Comentario)</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((r: any) => {
                  const initials = (r.user?.name || r.user?.email || "U").charAt(0).toUpperCase();
                  return (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={r.user?.image || ""} />
                            <AvatarFallback className="text-xs font-semibold bg-amber-500/20 text-amber-500">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium text-sm leading-tight">{r.user?.name || "Sin nombre"}</span>
                            <span className="text-xs text-muted-foreground">{r.user?.email || "Sin email"}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= (r.rating || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                          <span className="text-xs font-bold ml-1">({r.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 max-w-md">
                          <span className="font-semibold text-sm">{r.title}</span>
                          <span className="text-xs text-muted-foreground line-clamp-3 whitespace-pre-wrap">{r.content}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" }) : "—"}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deletingReviewId === r.id}
                          onClick={() => handleDeleteReview(r.id)}
                          className="h-8 px-2.5 text-xs"
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-1" />
                          {deletingReviewId === r.id ? "Borrando..." : "Eliminar"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuración del Sitio</CardTitle>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link href="/admin/settings">Configurar Enlaces y Redes</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
