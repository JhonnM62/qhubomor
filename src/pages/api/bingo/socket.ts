import type { NextApiRequest, NextApiResponse } from "next";
import { Server as IOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { prisma } from "@/lib/prisma";

type Player = { id: string; name: string; image?: string; role?: string; board: number[][]; marks: boolean[][] };
type State = {
  matchId?: string;
  started: boolean;
  calls: number[];
  players: Record<string, Player>;
};

const globalAny = global as any;
const io: IOServer = globalAny.bingo_io ?? null;
const state: State = globalAny.bingo_state ?? { started: false, calls: [], players: {} };
let scheduleTimer: NodeJS.Timeout | null = globalAny.bingo_scheduleTimer ?? null;
let scheduledStartAt: number | null = globalAny.bingo_scheduledStartAt ?? null;

function genBoard() {
  const ranges = [
    { min: 1, max: 15 },
    { min: 16, max: 30 },
    { min: 31, max: 45 },
    { min: 46, max: 60 },
    { min: 61, max: 75 },
  ];
  const board: number[][] = Array.from({ length: 5 }, (_, col) => {
    const nums = Array.from({ length: 15 }, (_, i) => ranges[col].min + i).sort(() => Math.random() - 0.5).slice(0, 5);
    return nums;
  });
  // transpose to rows and set center free
  const rows = Array.from({ length: 5 }, (_, r) => Array.from({ length: 5 }, (_, c) => board[c][r]));
  rows[2][2] = 0;
  return rows;
}

function checkBingo(p: Player, calls: number[]) {
  const isCalled = (n: number) => n === 0 || calls.includes(n);
  const rows = p.board.map((row) => row.every(isCalled));
  const cols = Array.from({ length: 5 }, (_, c) => p.board.every((row) => isCalled(row[c])));
  const diag1 = [0,1,2,3,4].every((i) => isCalled(p.board[i][i]));
  const diag2 = [0,1,2,3,4].every((i) => isCalled(p.board[i][4-i]));
  return { row: rows.some(Boolean), col: cols.some(Boolean), bingo: rows.every(Boolean) || cols.every(Boolean) || diag1 || diag2 };
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!(globalAny.bingo_io)) {
    const httpServer: HTTPServer = (res.socket as any).server as HTTPServer;
    const ioInstance = new IOServer(httpServer, { path: "/api/bingo/socket" });
    globalAny.bingo_io = ioInstance;
    globalAny.bingo_state = state;

    ioInstance.on("connection", async (socket) => {
      try {
        if (!state.started && !scheduledStartAt) {
          const upcoming = await prisma.bingoMatch.findFirst({ where: { startedAt: { gt: new Date() }, endedAt: null }, orderBy: { createdAt: "desc" } });
          if (upcoming?.startedAt) {
            scheduledStartAt = upcoming.startedAt.getTime();
            globalAny.bingo_scheduledStartAt = scheduledStartAt;
            state.matchId = upcoming.id;
            socket.emit("prepare", { startAt: scheduledStartAt });
          }
        }
        if (!scheduledStartAt && !state.started) {
          const active = await prisma.bingoMatch.findFirst({ where: { startedAt: { lte: new Date() }, endedAt: null }, orderBy: { createdAt: "desc" } });
          if (active) {
            state.started = true;
            state.matchId = active.id;
            socket.emit("started", { matchId: active.id });
          }
        }
      } catch {}
      if (scheduledStartAt && !state.started) {
        socket.emit("prepare", { startAt: scheduledStartAt });
      }
      if (state.started && state.matchId) {
        socket.emit("started", { matchId: state.matchId });
      }
      try {
        const active = await prisma.bingoParticipant.findMany({ where: state.matchId ? { active: true, matchId: state.matchId } : { active: true }, include: { user: { include: { role: true } } } });
        ioInstance.emit("lobby", { players: active.map((p) => ({ id: p.userId, name: p.user?.name ?? "", image: p.user?.image, role: p.user?.role?.name })) });
      } catch {}
      socket.on("register", async (payload: { id: string; name: string; image?: string }) => {
        console.log("[bingo] register", payload.id, payload.name);
        const board = genBoard();
        let role: string | undefined = undefined;
        try {
          const u = await prisma.user.findUnique({ where: { id: payload.id }, include: { role: true } });
          role = u?.role?.name ?? undefined;
          console.log("[bingo] resolved role", role, "for", payload.id);
        } catch {}
        const marks = Array.from({ length: 5 }, () => Array(5).fill(false));
        const norm = (payload.name || "").trim().toLowerCase();
        for (const [pid, pl] of Object.entries(state.players)) {
          const pn = (pl.name || "").trim().toLowerCase();
          if (pn === norm && pid !== payload.id) {
            delete state.players[pid];
          }
        }
        state.players[payload.id] = { id: payload.id, name: payload.name, image: payload.image, role, board, marks };
        console.log("[bingo] players count", Object.keys(state.players).length);
        socket.emit("board", { board });
        if (scheduledStartAt && !state.started) {
          socket.emit("prepare", { startAt: scheduledStartAt });
        }
        if (role !== "ADMIN" && state.matchId) {
          try {
            const existing = await prisma.bingoParticipant.findFirst({ where: { matchId: state.matchId as string, userId: payload.id } });
            if (!existing) {
              await prisma.bingoParticipant.create({ data: { userId: payload.id, matchId: state.matchId as string, active: true } });
              console.log("[bingo] participant linked", payload.id, state.matchId);
            }
            const active = await prisma.bingoParticipant.findMany({ where: state.matchId ? { active: true, matchId: state.matchId as string } : { active: true }, include: { user: { include: { role: true } } } });
            ioInstance.emit("lobby", { players: active.map((p) => ({ id: p.userId, name: p.user?.name ?? "", image: p.user?.image, role: p.user?.role?.name })) });
          } catch (e) { console.log("[bingo] participant create error", e); }
        }
      });

      socket.on("chat", (msg: { userId: string; content: string }) => {
        ioInstance.emit("chat", { ...msg, at: Date.now() });
      });

      socket.on("admin:start", async (payload?: { adminId?: string }) => {
        console.log("[bingo] admin:start", payload?.adminId);
        if (payload?.adminId) {
          const u = await prisma.user.findUnique({ where: { id: payload.adminId }, include: { role: true } });
          if (!u?.role || u.role.name !== "ADMIN") return;
        }
        state.started = true; state.calls = [];
        const match = await prisma.bingoMatch.create({ data: { calls: JSON.stringify([]), startedAt: new Date(), status: 'EN_CURSO' } });
        state.matchId = match.id;
        console.log("[bingo] match created", match.id);
        ioInstance.emit("started", { matchId: match.id });
        for (const p of Object.values(state.players)) {
          if (p.role === "ADMIN") continue;
          const exists = await prisma.bingoParticipant.findFirst({ where: { matchId: match.id, userId: p.id } });
          if (!exists) {
            await prisma.bingoParticipant.create({ data: { matchId: match.id, userId: p.id } }).catch(() => {});
            console.log("[bingo] participant added", p.id, match.id);
          }
        }
      });

      socket.on("admin:call", async (payload?: { adminId?: string }) => {
        console.log("[bingo] admin:call", payload?.adminId);
        if (payload?.adminId) {
          const u = await prisma.user.findUnique({ where: { id: payload.adminId }, include: { role: true } });
          if (!u?.role || u.role.name !== "ADMIN") return;
        }
        if (!state.started) return;
        // generate next call 1..75 not yet called
        const pool = Array.from({ length: 75 }, (_, i) => i + 1).filter((n) => !state.calls.includes(n));
        if (pool.length === 0) return;
        const n = pool[Math.floor(Math.random() * pool.length)];
        state.calls.push(n);
        const letter = n <= 15 ? 'B' : n <= 30 ? 'I' : n <= 45 ? 'N' : n <= 60 ? 'G' : 'O';
        console.log("[bingo] called number", letter, n, "total", state.calls.length);
        ioInstance.emit("called", { number: n, letter, calls: state.calls });
      });

      socket.on("player:claim", async (payload: { id: string }) => {
        const p = state.players[payload.id];
        if (!p) { socket.emit("claim_result", { ok: false, reason: "no_user" }); return; }
        if (!state.started || !state.matchId) { socket.emit("claim_result", { ok: false, reason: "no_match" }); return; }
        const full = p.board.every((row, r) => row.every((n, c) => n === 0 || !!p.marks[r][c]));
        if (full) {
          try {
            const code = `BINGO-${Date.now()}-${Math.random().toString(36).slice(2,8).toUpperCase()}`;
            const qrData = `BINGO|${p.id}|${state.matchId}|${code}`;
            const winner = await prisma.bingoWinner.upsert({
              where: { matchId_userId: { matchId: state.matchId as string, userId: p.id } },
              update: { code, qrData, board: JSON.stringify(p.board), calls: JSON.stringify(state.calls) },
              create: { matchId: state.matchId as string, userId: p.id, code, qrData, board: JSON.stringify(p.board), calls: JSON.stringify(state.calls) },
            });
            const promo = await prisma.promoCode.upsert({
              where: { code },
              update: { qrData, userId: p.id },
              create: { code, qrData, prizeType: 'DISCOUNT_100', userId: p.id },
            });
            await prisma.bingoWinner.update({ where: { id: winner.id }, data: { promoCodeId: promo.id } });
          } catch {}
          ioInstance.emit("winner", { id: p.id, name: p.name });
        } else {
          socket.emit("claim_result", { ok: false, reason: "not_full" });
        }
      });

      // removed: player:stop

      socket.on("admin:stop", async (payload?: { adminId?: string }) => {
        if (payload?.adminId) {
          const u = await prisma.user.findUnique({ where: { id: payload.adminId }, include: { role: true } });
          if (!u?.role || u.role.name !== "ADMIN") return;
        }
        state.started = false;
        if (state.matchId) {
          await prisma.bingoMatch.update({ where: { id: state.matchId }, data: { endedAt: new Date(), calls: JSON.stringify(state.calls), status: 'FINALIZADA' } });
        }
        state.matchId = undefined; state.calls = [];
        ioInstance.emit("ended", { ok: true });
      });

      socket.on("admin:schedule", async (payload: { adminId: string; minutes: number }) => {
        console.log("[bingo] admin:schedule", payload.adminId, payload.minutes);
        const u = await prisma.user.findUnique({ where: { id: payload.adminId }, include: { role: true } });
        if (!u?.role || u.role.name !== "ADMIN") return;
        if (scheduleTimer) clearTimeout(scheduleTimer);
        const ms = Math.max(0, Math.floor(payload.minutes * 60 * 1000));
        scheduledStartAt = Date.now() + ms;
        globalAny.bingo_scheduledStartAt = scheduledStartAt;
        state.started = false; state.calls = [];
        const match = await prisma.bingoMatch.create({ data: { calls: JSON.stringify([]), startedAt: new Date(scheduledStartAt), status: 'EN_ESPERA' } });
        state.matchId = match.id;
        console.log("[bingo] match scheduled", match.id, new Date(scheduledStartAt).toISOString());
        ioInstance.emit("prepare", { startAt: scheduledStartAt });
        ioInstance.emit("invite", { matchId: state.matchId });
        const scheduledMatchId = match.id;
        scheduleTimer = setTimeout(async () => {
          state.started = true;
          await prisma.bingoMatch.update({ where: { id: scheduledMatchId }, data: { startedAt: new Date(), status: 'EN_CURSO' } }).catch(() => {});
          ioInstance.emit("started", { matchId: scheduledMatchId });
          console.log("[bingo] started scheduled", scheduledMatchId);
          if (state.matchId) {
            for (const p of Object.values(state.players)) {
              if (p.role === "ADMIN") continue;
              const exists = await prisma.bingoParticipant.findFirst({ where: { matchId: state.matchId, userId: p.id } });
              if (!exists) {
                await prisma.bingoParticipant.create({ data: { matchId: state.matchId, userId: p.id } }).catch(() => {});
                console.log("[bingo] participant added on schedule", p.id, state.matchId);
              }
            }
          }
          scheduleTimer = null; scheduledStartAt = null; globalAny.bingo_scheduleTimer = null; globalAny.bingo_scheduledStartAt = null;
        }, ms);
        globalAny.bingo_scheduleTimer = scheduleTimer;
      });

      socket.on("admin:save", async (payload: { adminId: string }) => {
        const u = await prisma.user.findUnique({ where: { id: payload.adminId }, include: { role: true } });
        if (!u?.role || u.role.name !== "ADMIN") return;
        if (state.matchId) {
          await prisma.bingoMatch.update({ where: { id: state.matchId }, data: { calls: JSON.stringify(state.calls) } });
          ioInstance.emit("saved", { ok: true });
        }
      });

      socket.on("player:mark", async (payload: { id: string; row: number; col: number; marked: boolean }) => {
        const p = state.players[payload.id];
        if (!p) { console.log("[bingo] mark no player", payload); return; }
        if (p.role === "ADMIN") { console.log("[bingo] mark ignored for admin", p.id); return; }
        const { row, col } = payload;
        if (row >= 0 && row < 5 && col >= 0 && col < 5) {
          p.marks[row][col] = !!payload.marked;
          socket.emit("mark", { marks: p.marks });
          try {
            await prisma.bingoBoard.upsert({
              where: { userId: p.id },
              update: { marks: JSON.stringify(p.marks), updatedAt: new Date() },
              create: { userId: p.id, board: JSON.stringify(p.board), marks: JSON.stringify(p.marks) },
            });
            console.log("[bingo] marks persisted", { userId: p.id, row, col, marked: p.marks[row][col] });
          } catch (e) {
            console.log("[bingo] marks persist error", e);
          }
        }
      });

      socket.on("player:saveBoard", async (payload: { id: string }) => {
        const p = state.players[payload.id];
        if (!p) { console.log("[bingo] saveBoard no player", payload.id); socket.emit("saved_board", { ok: false }); return; }
        if (p.role === "ADMIN") { console.log("[bingo] saveBoard ignored for admin", p.id); socket.emit("saved_board", { ok: false }); return; }
        try {
          await prisma.bingoBoard.upsert({
            where: { userId: p.id },
            update: { board: JSON.stringify(p.board), marks: JSON.stringify(p.marks), updatedAt: new Date() },
            create: { userId: p.id, board: JSON.stringify(p.board), marks: JSON.stringify(p.marks) },
          });
          if (state.matchId && state.started) {
            const exists = await prisma.bingoParticipant.findFirst({ where: { matchId: state.matchId as string, userId: p.id } });
            if (!exists) {
              await prisma.bingoParticipant.create({ data: { matchId: state.matchId as string, userId: p.id } });
              console.log("[bingo] saveBoard participant added", p.id, state.matchId);
            } else {
              console.log("[bingo] saveBoard participant exists", p.id, state.matchId);
            }
          } else {
            console.log("[bingo] saveBoard no match or not started", { matchId: state.matchId, started: state.started });
          }
          socket.emit("saved_board", { ok: true });
        } catch (e) {
          console.log("[bingo] saveBoard error", e);
          socket.emit("saved_board", { ok: false });
        }
      });

      socket.on("player:reroll", async (payload: { id: string }) => {
        let p = state.players[payload.id];
        if (!p) {
          try {
            const u = await prisma.user.findUnique({ where: { id: payload.id }, include: { role: true } });
            const name = u?.name ?? "Jugador";
            const role = u?.role?.name ?? undefined;
            const image = u?.image ?? undefined;
            p = { id: payload.id, name, image, role, board: genBoard(), marks: Array.from({ length: 5 }, () => Array(5).fill(false)) };
          } catch {}
          if (!p) {
            p = { id: payload.id, name: "Jugador", board: genBoard(), marks: Array.from({ length: 5 }, () => Array(5).fill(false)) } as any;
          }
          state.players[payload.id] = p;
          ioInstance.emit("lobby", { players: Object.values(state.players) });
        }
        if (p.role === "ADMIN") { console.log("[bingo] reroll ignored for admin", p.id); socket.emit("rerolled", { ok: false }); return; }
        let board = genBoard();
        let tries = 0;
        const sameBoard = (a: number[][], b: number[][]) => a.every((row, i) => row.every((v, j) => v === b[i][j]));
        while (sameBoard(board, p.board) && tries < 5) { board = genBoard(); tries++; }
        const marks = Array.from({ length: 5 }, () => Array(5).fill(false));
        p.board = board; p.marks = marks;
        socket.emit("board", { board });
        socket.emit("rerolled", { ok: true });
      });

      socket.on("player:leave", async (payload: { id: string }) => {
        try {
          await prisma.bingoParticipant.updateMany({ where: { userId: payload.id, active: true }, data: { active: false } });
          const active = await prisma.bingoParticipant.findMany({ where: state.matchId ? { active: true, matchId: state.matchId } : { active: true }, include: { user: { include: { role: true } } } });
          ioInstance.emit("lobby", { players: active.map((p) => ({ id: p.userId, name: p.user?.name ?? "", image: p.user?.image, role: p.user?.role?.name })) });
          console.log("[bingo] participant set inactive", payload.id);
        } catch (e) { console.log("[bingo] leave error", e); }
      });
      socket.on("player:link", async (payload: { id: string }) => {
        const pl = state.players[payload.id];
        if (!pl) { console.log("[bingo] link no player", payload.id); return; }
        if (pl.role === "ADMIN") { console.log("[bingo] link ignored for admin", pl.id); return; }
        if (!state.matchId) { console.log("[bingo] link no match", payload.id); return; }
        try {
          const exists = await prisma.bingoParticipant.findFirst({ where: { matchId: state.matchId as string, userId: pl.id } });
          if (!exists) {
            await prisma.bingoParticipant.create({ data: { matchId: state.matchId as string, userId: pl.id, active: true } });
            console.log("[bingo] participant linked by user", pl.id, state.matchId);
          }
          const active = await prisma.bingoParticipant.findMany({ where: { active: true, matchId: state.matchId as string }, include: { user: { include: { role: true } } } });
          ioInstance.emit("lobby", { players: active.map((pp) => ({ id: pp.userId, name: pp.user?.name ?? "", image: pp.user?.image, role: pp.user?.role?.name })) });
        } catch (e) { console.log("[bingo] link error", e); }
      });
      socket.on("disconnect", async () => {
        try {
          const ids = Object.keys(state.players);
          for (const id of ids) {
            await prisma.bingoParticipant.updateMany({ where: { userId: id, active: true }, data: { active: false } });
          }
          const active = await prisma.bingoParticipant.findMany({ where: state.matchId ? { active: true, matchId: state.matchId } : { active: true }, include: { user: { include: { role: true } } } });
          ioInstance.emit("lobby", { players: active.map((p) => ({ id: p.userId, name: p.user?.name ?? "", image: p.user?.image, role: p.user?.role?.name })) });
        } catch {}
      });
    });
  }
  res.end();
}
