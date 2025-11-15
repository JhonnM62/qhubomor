"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaGift, FaGamepad, FaQrcode } from "react-icons/fa";
import UserNav from "@/components/site/UserNav";
import { useSession } from "next-auth/react";

export default function Header() {
  const { data } = useSession();
  const isLoggedIn = !!data?.user;
  const isAdmin = (data as any)?.role === "ADMIN";
  return (
    <header className="border-b bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto flex h-14 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FaGift size={24} className="text-primary" />
          <span>Qhubomor Casino</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/games" className="flex items-center gap-1 hover:underline">
            <FaGamepad size={24} className="text-primary" />
            <span>Juegos</span>
          </Link>
          <Link href="/claim" className="flex items-center gap-1 hover:underline">
            <FaQrcode size={24} className="text-primary" />
            <span>Reclamar</span>
          </Link>
          {!isLoggedIn && <Link href="/register" className="hover:underline">Registro</Link>}
          {!isLoggedIn && <Link href="/login" className="hover:underline">Login</Link>}
          {isAdmin && <Link href="/admin" className="hover:underline">Admin</Link>}
          {isAdmin && <Link href="/admin/dashboard" className="hover:underline">Dashboard</Link>}
          <Button asChild size="sm">
            <Link href="/games">Jugar ahora</Link>
          </Button>
          <UserNav />
        </nav>
      </div>
    </header>
  );
}
