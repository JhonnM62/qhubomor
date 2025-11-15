"use client";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useBingo } from "@/components/providers/BingoProvider";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
 

export default function BingoClient() {
  const router = useRouter();
  const { data, status } = useSession();
  const { players, calls, board, marks, chat, adminStart, adminCall, adminStop, adminSchedule, adminSave, userMark, claim, sendChat, ready, register, prepareAt, startedAt, userSaveBoard, userRerollBoard, userLeave, userLink, savedBoardInfo, rerollInfo, inviteMatchId, ended, ackEnd, claiming, winner, ackWin, claimResult, matchId } = useBingo();
  const { data: summary } = useSWR("/api/profile/summary", (u) => fetch(u).then((r) => r.json()));
  const name = (summary?.user as any)?.name ?? (data?.user as any)?.name ?? "Invitado";
  const userId = (data as any)?.userId ?? (summary?.user as any)?.id ?? "guest";
  const image = (summary?.user as any)?.image ?? (data?.user as any)?.image;
  const loadingSummary = !summary || !summary.user;
  const role = summary?.user?.role?.name ?? (data as any)?.role ?? "USER";
  const isAdmin = role === "ADMIN";
  useEffect(() => { if (!loadingSummary) { console.log("[bingo-client] role", role, "isAdmin", isAdmin); } }, [loadingSummary, role, isAdmin]);
  const [openCfg, setOpenCfg] = useState(false);
  const [delayMinutes, setDelayMinutes] = useState(3);
  const [ballsNumber, setBallsNumber] = useState(75);
  const [roundDuration, setRoundDuration] = useState(300);
  const [mode, setMode] = useState("full_card");
  const [countdown, setCountdown] = useState<number | null>(null);
  const registeredRef = useRef(false);
  const [boardSaved, setBoardSaved] = useState(false);
  const boardSavedRef = useRef(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [confirmLeaveOpen, setConfirmLeaveOpen] = useState(false);

  useEffect(() => {
    if (ready && summary?.user?.id && !registeredRef.current) {
      register({ id: summary.user.id, name, image });
      registeredRef.current = true;
    }
  }, [ready, summary?.user?.id, name, image, register]);

  useEffect(() => {
    if (prepareAt) {
      const ms = prepareAt - Date.now();
      const mins = Math.max(0, Math.round(ms / 60000));
      toast.info(`El BINGO iniciará en ~${mins} minutos`);
      const update = () => {
        const remaining = Math.max(0, prepareAt - Date.now());
        setCountdown(Math.ceil(remaining / 1000));
      };
      update();
      const t = setInterval(update, 1000);
      return () => clearInterval(t);
    }
  }, [prepareAt]);

  useEffect(() => {
    if (savedBoardInfo) {
      if (savedBoardInfo.ok) toast.success("Tu tabla ha sido guardada");
      else toast.error("No se pudo guardar tu tabla");
      if (savedBoardInfo.ok) { setBoardSaved(true); boardSavedRef.current = true; }
    }
  }, [savedBoardInfo]);

  useEffect(() => { setInviteOpen(!!inviteMatchId && !boardSaved); }, [inviteMatchId, boardSaved]);

  useEffect(() => {
    if (rerollInfo) {
      if (rerollInfo.ok) toast.success("Tu tabla ha sido variada");
      else toast.error("No se pudo variar tu tabla");
    }
  }, [rerollInfo]);

  useEffect(() => {
    if (claimResult) {
      if (!claimResult.ok) {
        const reason = claimResult.reason;
        const msg = reason === 'no_user' ? 'No estás registrado en el juego' : reason === 'no_match' ? 'No hay partida en curso' : reason === 'not_full' ? 'Tu tabla no está completa' : 'No se pudo validar tu BINGO';
        toast.error(msg);
      }
    }
  }, [claimResult]);

  useEffect(() => {
    if (startedAt) {
      toast.success("El BINGO va a iniciar, prepárate!");
      if (!isAdmin && userId !== "guest" && !boardSavedRef.current) {
        userSaveBoard(userId);
      }
    }
  }, [startedAt]);

  

  const seenNames = new Set<string>();
  const isFull = board.every((row, ri) => row.every((n, ci) => n === 0 || !!marks?.[ri]?.[ci]));
  if (loadingSummary) {
    return (
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>BINGO en vivo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-sm text-muted-foreground">Cargando...</div>
          </CardContent>
        </Card>
      </div>
    );
  }
  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle>BINGO en vivo</CardTitle>
        </CardHeader>
          <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {calls.map((n) => {
              const letter = n <= 15 ? 'B' : n <= 30 ? 'I' : n <= 45 ? 'N' : n <= 60 ? 'G' : 'O';
              return (
                <div key={n} className="h-8 px-2 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs">{letter}-{n}</div>
              );
            })}
          </div>
          {!isAdmin ? (
            <div className="w-max mx-auto">
              <div className="grid grid-cols-5 gap-1 mb-1">
                {['B','I','N','G','O'].map((h) => (
                  <div key={h} className="h-8 w-10 flex items-center justify-center rounded bg-accent text-accent-foreground font-bold">{h}</div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {board.map((row, ri) => row.map((n, ci) => {
                  const marked = n === 0 || marks?.[ri]?.[ci];
                  return (
                    <div
                      key={`${ri}-${ci}`}
                      className={`h-10 w-10 flex items-center justify-center rounded border text-sm ${marked ? "bg-primary text-primary-foreground" : "bg-card"}`}
                      onClick={() => { if (userId !== "guest") { if (n !== 0) userMark(userId, ri, ci, !marked); } else toast.error("Debes iniciar sesión"); }}
                    >{n === 0 ? "★" : n}</div>
                  );
                }))}
              </div>
            </div>
          ) : (
            <div className="w-max mx-auto">
              <div className="grid grid-cols-5 gap-1 mb-1">
                {['B','I','N','G','O'].map((h) => (
                  <div key={h} className="h-8 w-10 flex items-center justify-center rounded bg-accent text-accent-foreground font-bold">{h}</div>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-1">
                {Array.from({ length: 15 }, (_, r) => r).map((r) => (
                  [0,1,2,3,4].map((c) => {
                    const base = c === 0 ? 1 : c === 1 ? 16 : c === 2 ? 31 : c === 3 ? 46 : 61;
                    const n = base + r;
                    const called = calls.includes(n);
                    const letter = c === 0 ? 'B' : c === 1 ? 'I' : c === 2 ? 'N' : c === 3 ? 'G' : 'O';
                    return (
                      <div key={`${letter}-${n}`} className={`h-8 w-10 rounded flex items-center justify-center text-xs ${called ? 'bg-primary text-primary-foreground' : 'bg-card border'}`}>{letter}-{n}</div>
                    );
                  })
                ))}
              </div>
            </div>
          )}
          {countdown !== null && !startedAt && (
            <div className="text-center text-sm text-muted-foreground">El juego iniciará en {Math.floor((countdown ?? 0)/60)}:{String((countdown ?? 0)%60).padStart(2,'0')}</div>
          )}
          <div className="flex gap-2 justify-center">
            {!isAdmin && (
              <Button
                onClick={() => { if (userId !== "guest") { claim(userId); } else { toast.error("Debes iniciar sesión"); } }}
                disabled={!ready || userId === "guest" || !isFull || claiming}
              >
                {claiming ? 'Revisando...' : '¡BINGO!'}
              </Button>
            )}
            {!isAdmin && !boardSaved && (!!prepareAt || !!startedAt) && (
              <Button
                variant="secondary"
                onClick={() => { if (userId !== "guest") { userSaveBoard(userId); } else { toast.error("Debes iniciar sesión"); } }}
                disabled={!ready || userId === "guest"}
              >
                Guardar tabla
              </Button>
            )}
            {!isAdmin && !boardSaved && (
              <Button
                variant="outline"
                onClick={() => { if (userId !== "guest") { userRerollBoard(userId); } else { toast.error("Debes iniciar sesión"); } }}
                disabled={!ready || userId === "guest"}
              >
                Variar tabla
              </Button>
            )}
            {!isAdmin && (
              <Button variant="destructive" onClick={() => { if (userId !== "guest") { userLeave(userId); toast.success("Has abandonado la partida"); } }}>
                Abandonar partida
              </Button>
            )}
            {isAdmin && (
              <>
                <Button onClick={() => { console.log('[bingo-client] adminCall', userId); adminCall(userId); }} variant="secondary">Generar número</Button>
                <Button onClick={() => setOpenCfg(true)} variant="outline">Iniciar</Button>
                <Button onClick={() => { console.log('[bingo-client] adminStop', userId); adminStop(userId); }} variant="destructive">Finalizar</Button>
                <Button onClick={() => { console.log('[bingo-client] adminSave', userId); adminSave(userId); }} variant="secondary">Guardar números</Button>
              </>
            )}
          </div>
          {isAdmin && (
            <Dialog open={openCfg} onOpenChange={setOpenCfg}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Configurar partida de Bingo</DialogTitle>
                </DialogHeader>
                <div className="grid gap-3">
                  <div className="flex items-center gap-2">
                    <label className="w-44 text-sm">Minutos para iniciar</label>
                    <Input type="number" min={0} value={delayMinutes} onChange={(e) => setDelayMinutes(Number(e.target.value || 0))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-44 text-sm">Bolas</label>
                    <Input type="number" min={1} max={90} value={ballsNumber} onChange={(e) => setBallsNumber(Number(e.target.value || 75))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-44 text-sm">Duración (segundos)</label>
                    <Input type="number" min={30} value={roundDuration} onChange={(e) => setRoundDuration(Number(e.target.value || 300))} />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="w-44 text-sm">Modo de juego</label>
                    <select className="border rounded h-9 px-2" value={mode} onChange={(e) => setMode(e.target.value)}>
                      <option value="full_card">Toda la tabla</option>
                      <option value="any_row">Cualquier fila</option>
                      <option value="any_column">Cualquier columna</option>
                      <option value="diagonal">Diagonal</option>
                    </select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenCfg(false)}>Cancelar</Button>
                  <Button onClick={async () => {
                    const body = { ballsNumber, roundDuration, restrictions: { mode } };
                    const res = await fetch('/api/admin/bingo/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
                    if (!res.ok) { toast.error('No se pudo guardar la configuración'); return; }
                    adminSchedule(userId, delayMinutes);
                    setOpenCfg(false);
                    toast.success('Configuración guardada. Se notificó a los usuarios.');
                  }}>Guardar e iniciar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {!isAdmin && inviteOpen && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Unirse a la partida</DialogTitle>
                </DialogHeader>
                <div className="text-sm">Se ha creado una nueva partida. ¿Deseas vincular tu tabla a este juego?</div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => { setInviteOpen(false); setConfirmLeaveOpen(true); }}>No ahora</Button>
                  <Button onClick={() => { if (userId !== "guest") { userLink(userId); setInviteOpen(false); toast.success("Vinculado a la partida"); } }}>Sí</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {!isAdmin && confirmLeaveOpen && (
            <Dialog open={confirmLeaveOpen} onOpenChange={setConfirmLeaveOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Salir sin unirse?</DialogTitle>
                </DialogHeader>
                <div className="text-sm">Si confirmas, te llevaremos a la página de juegos.</div>
                <DialogFooter>
                  <Button onClick={() => { setConfirmLeaveOpen(false); router.push('/games'); }}>Sí</Button>
                  <Button variant="outline" onClick={() => { setConfirmLeaveOpen(false); setInviteOpen(true); }}>No</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {ended && (
            <Dialog open={true}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>La partida ha finalizado</DialogTitle>
                </DialogHeader>
                <div className="text-sm">Gracias por participar.</div>
                <DialogFooter>
                  <Button onClick={() => { ackEnd(); router.push('/games'); }}>Entendido</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          {winner && (
            <Dialog open={true}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¡Ganaste!</DialogTitle>
                </DialogHeader>
                {winner.id === userId ? (
                  <div className="grid gap-2">
                    <div className="text-sm">Por favor completa tus datos para gestionar tu premio.</div>
                    <Input placeholder="Nombre" id="win-nombre" defaultValue={name} />
                    <Input placeholder="Cédula" id="win-cedula" />
                    <Input placeholder="Teléfono" id="win-telefono" />
                    <Input placeholder="Dirección" id="win-direccion" />
                    <div className="flex items-center gap-2"><input id="win-edad" type="checkbox" /> <label htmlFor="win-edad" className="text-sm">Confirmo que soy mayor de edad</label></div>
                    <input type="file" id="win-card" accept="image/*" />
                  </div>
                ) : (
                  <div className="text-sm">Felicitaciones {winner.name}. Tu BINGO fue validado.</div>
                )}
                <DialogFooter>
                  {winner.id === userId ? (
                    <Button onClick={async () => {
                      const fd = new FormData();
                      fd.append('userId', userId);
                      if (matchId) fd.append('matchId', matchId);
                      fd.append('nombre', (document.getElementById('win-nombre') as HTMLInputElement)?.value || '');
                      fd.append('cedula', (document.getElementById('win-cedula') as HTMLInputElement)?.value || '');
                      fd.append('telefono', (document.getElementById('win-telefono') as HTMLInputElement)?.value || '');
                      fd.append('direccion', (document.getElementById('win-direccion') as HTMLInputElement)?.value || '');
                      fd.append('edadConfirmada', String((document.getElementById('win-edad') as HTMLInputElement)?.checked || false));
                      const fileInput = document.getElementById('win-card') as HTMLInputElement;
                      if (fileInput?.files?.[0]) fd.append('cardPhoto', fileInput.files[0]);
                      const res = await fetch('/api/bingo/winner', { method: 'POST', body: fd });
                      if (res.ok) { toast.success('Datos enviados'); ackWin(); router.push('/games'); } else { toast.error('No se pudo enviar'); }
                    }}>Enviar</Button>
                  ) : (
                    <Button onClick={() => { ackWin(); }}>Cerrar</Button>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {players
              .filter((p) => p.id !== "guest" && p.name !== "Invitado" && (p as any).role !== "ADMIN")
              .filter((p) => { const key = (p.name || "").trim().toLowerCase(); if (seenNames.has(key)) return false; seenNames.add(key); return true; })
              .map((p) => (
                <div key={p.id} className="flex items-center gap-2">
                  <div className="relative h-8 w-8 rounded-full overflow-hidden border">
                    {p.image && <Image src={p.image} alt="avatar" fill />}
                  </div>
                  <div className="text-sm">{p.name}</div>
                </div>
              ))}
          </div>
          {isAdmin && (
            <div className="grid gap-2">
              {chat.map((m, idx) => (
                <div key={idx} className="text-sm"><span className="font-medium">{m.userId}:</span> {m.content}</div>
              ))}
              <div className="flex gap-2">
                <Input placeholder="Escribe..." onKeyDown={(e) => { if (e.key === "Enter") { const txt = (e.target as HTMLInputElement).value; if (txt) { sendChat(userId, txt); (e.target as HTMLInputElement).value = ""; } } }} />
                <Button onClick={() => { const el = document.querySelector<HTMLInputElement>("input[placeholder='Escribe...']"); if (el?.value) { sendChat(userId, el.value); el.value = ""; } }}>Enviar</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
