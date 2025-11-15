"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

type ChatMsg = { userId: string; content: string; at: number };
type Player = { id: string; name: string; image?: string; role?: string };

type BingoCtx = {
  players: Player[];
  calls: number[];
  board: number[][];
  marks: boolean[][];
  chat: ChatMsg[];
  prepareAt: number | null;
  startedAt: number | null;
  adminStart: (adminId: string) => void;
  adminCall: (adminId: string) => void;
  adminStop: (adminId: string) => void;
  adminSchedule: (adminId: string, minutes: number) => void;
  adminSave: (adminId: string) => void;
  userMark: (userId: string, row: number, col: number, marked: boolean) => void;
  userSaveBoard: (userId: string) => void;
  userRerollBoard: (userId: string) => void;
  userLeave: (userId: string) => void;
  userLink: (userId: string) => void;
  claim: (id: string) => void;
  sendChat: (userId: string, content: string) => void;
  ready: boolean;
  register: (user: Player) => void;
  savedBoardInfo: { ok: boolean } | null;
  rerollInfo: { ok: boolean } | null;
  inviteMatchId: string | null;
  ended: boolean;
  ackEnd: () => void;
  claiming: boolean;
  winner: { id: string; name: string } | null;
  ackWin: () => void;
  claimResult: { ok: boolean; reason?: string } | null;
  matchId: string | null;
};

const Ctx = createContext<BingoCtx | null>(null);

export default function BingoProvider({ children }: { children: React.ReactNode }) {
  const sockRef = useRef<Socket | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [calls, setCalls] = useState<number[]>([]);
  const [board, setBoard] = useState<number[][]>([]);
  const [marks, setMarks] = useState<boolean[][]>(Array.from({ length: 5 }, () => Array(5).fill(false)));
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [ready, setReady] = useState(false);
  const [prepareAt, setPrepareAt] = useState<number | null>(null);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [savedBoardInfo, setSavedBoardInfo] = useState<{ ok: boolean } | null>(null);
  const [rerollInfo, setRerollInfo] = useState<{ ok: boolean } | null>(null);
  const [inviteMatchId, setInviteMatchId] = useState<string | null>(null);
  const [ended, setEnded] = useState(false);
  const [claiming, setClaiming] = useState(false);
  const [winner, setWinner] = useState<{ id: string; name: string } | null>(null);
  const [claimResult, setClaimResult] = useState<{ ok: boolean; reason?: string } | null>(null);
  const [matchId, setMatchId] = useState<string | null>(null);

  useEffect(() => {
    if (!sockRef.current) {
      const s = io({ path: "/api/bingo/socket" });
      sockRef.current = s;
      s.on("board", (payload) => { setBoard(payload.board); setMarks(Array.from({ length: 5 }, () => Array(5).fill(false))); });
      s.on("lobby", (payload) => setPlayers(payload.players));
      s.on("called", (payload) => { setCalls(payload.calls); });
      s.on("mark", (payload) => setMarks(payload.marks));
      s.on("chat", (msg) => setChat((c) => [...c.slice(-49), msg]));
      s.on("prepare", (payload) => setPrepareAt(payload.startAt ?? null));
      s.on("started", (payload) => { setStartedAt(Date.now()); setMatchId(payload?.matchId ?? null); });
      s.on("saved", () => {/* no-op */});
      s.on("saved_board", (payload) => setSavedBoardInfo(payload));
      s.on("rerolled", (payload) => setRerollInfo(payload));
      s.on("invite", (payload) => setInviteMatchId(payload.matchId ?? null));
      s.on("ended", () => setEnded(true));
      s.on("winner", (payload) => { setWinner(payload); setClaiming(false); });
      s.on("claim_result", (payload) => { setClaiming(false); setClaimResult(payload); });
      s.on("connect", () => setReady(true));
    }
    return () => {
      // Keep socket for persistence across pages
    };
  }, []);

  const value = useMemo<BingoCtx>(() => ({
    players,
    calls,
    board,
    marks,
    chat,
    prepareAt,
    startedAt,
    adminStart: (adminId: string) => sockRef.current?.emit("admin:start", { adminId }),
    adminCall: (adminId: string) => sockRef.current?.emit("admin:call", { adminId }),
    adminStop: (adminId: string) => sockRef.current?.emit("admin:stop", { adminId }),
    adminSchedule: (adminId: string, minutes: number) => sockRef.current?.emit("admin:schedule", { adminId, minutes }),
    adminSave: (adminId: string) => sockRef.current?.emit("admin:save", { adminId }),
    userMark: (userId: string, row: number, col: number, marked: boolean) => sockRef.current?.emit("player:mark", { id: userId, row, col, marked }),
    userSaveBoard: (userId: string) => sockRef.current?.emit("player:saveBoard", { id: userId }),
    userRerollBoard: (userId: string) => sockRef.current?.emit("player:reroll", { id: userId }),
    userLeave: (userId: string) => sockRef.current?.emit("player:leave", { id: userId }),
    userLink: (userId: string) => sockRef.current?.emit("player:link", { id: userId }),
    claim: (id: string) => { setClaiming(true); sockRef.current?.emit("player:claim", { id }); },
    sendChat: (userId: string, content: string) => sockRef.current?.emit("chat", { userId, content }),
    ready,
    register: (user: Player) => sockRef.current?.emit("register", user),
    savedBoardInfo,
    rerollInfo,
    inviteMatchId,
    ended,
    ackEnd: () => { try { sockRef.current?.disconnect(); } catch {} },
    claiming,
    winner,
    ackWin: () => setWinner(null),
    claimResult,
    matchId,
  }), [players, calls, board, marks, chat, ready, prepareAt, startedAt, savedBoardInfo, rerollInfo, inviteMatchId, ended, claiming, winner, claimResult, matchId]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useBingo() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useBingo must be used within BingoProvider");
  return ctx;
}
