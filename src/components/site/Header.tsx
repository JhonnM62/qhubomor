"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FaCocktail, FaGamepad, FaQrcode, FaShareAlt } from "react-icons/fa";
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
          <FaCocktail size={20} className="text-primary md:size-6" />
          <span className="text-sm md:text-base">Q'hubo Mor</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-2 md:gap-4 text-xs md:text-sm justify-end">
          {/* <Link href="/games" className="flex items-center gap-1 hover:underline">
            <FaGamepad size={20} className="text-primary md:size-6" />
            <span>Juegos</span>
          </Link>
          <Link href="/claim" className="flex items-center gap-1 hover:underline">
            <FaQrcode size={20} className="text-primary md:size-6" />
            <span>Reclamar</span>
          </Link> */}
          <Button asChild variant="ghost" size="sm" className="bg-black/40 hover:bg-emerald-900/40 text-white border border-white/10 hover:border-emerald-500/50 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-emerald-500/20 hover:-translate-y-0.5">
            <Link href="/links" className="flex items-center gap-2 px-4">
              <FaShareAlt size={14} className="text-emerald-400" />
              <span className="font-medium tracking-wide">Redes</span>
            </Link>
          </Button>
          
          {!isLoggedIn && (
            <Button asChild variant="ghost" size="sm" className="bg-black/40 hover:bg-emerald-900/40 text-white border border-white/10 hover:border-emerald-500/50 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-emerald-500/20 hover:-translate-y-0.5">
              <Link href="/register" className="px-4 font-medium tracking-wide">Registro</Link>
            </Button>
          )}
          
          {!isLoggedIn && (
            <Button asChild variant="ghost" size="sm" className="bg-black/40 hover:bg-emerald-900/40 text-white border border-white/10 hover:border-emerald-500/50 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-emerald-500/20 hover:-translate-y-0.5">
              <Link href="/login" className="px-4 font-medium tracking-wide">Login</Link>
            </Button>
          )}
          {isAdmin && <Link href="/admin" className="hover:underline">Admin</Link>}
          {isAdmin && <Link href="/admin/dashboard" className="hover:underline">Dashboard</Link>}
          {/* <Button asChild size="sm" className="hidden xs:inline-flex">
            <Link href="/games">Jugar ahora</Link>
          </Button> */}
          <UserNav />
        </nav>
      </div>
    </header>
  );
}
