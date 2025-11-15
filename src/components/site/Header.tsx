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
      <div className="max-w-6xl mx-auto flex h-16 md:h-14 items-center justify-between px-3 md:px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <FaGift size={20} className="text-primary md:size-6" />
          <span className="text-sm md:text-base">Qhubomor Casino</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm justify-end">
          <Link href="/games" className="flex items-center gap-1 hover:underline">
            <FaGamepad size={20} className="text-primary md:size-6" />
            <span>Juegos</span>
          </Link>
          <Link href="/claim" className="flex items-center gap-1 hover:underline">
            <FaQrcode size={20} className="text-primary md:size-6" />
            <span>Reclamar</span>
          </Link>
          {!isLoggedIn && <Link href="/register" className="hover:underline">Registro</Link>}
          {!isLoggedIn && <Link href="/login" className="hover:underline">Login</Link>}
          {isAdmin && <Link href="/admin" className="hover:underline">Admin</Link>}
          {isAdmin && <Link href="/admin/dashboard" className="hover:underline">Dashboard</Link>}
          <Button asChild size="sm" className="hidden xs:inline-flex">
            <Link href="/games">Jugar ahora</Link>
          </Button>
          <UserNav />
        </nav>
      </div>
    </header>
  );
}
