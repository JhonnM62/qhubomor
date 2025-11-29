"use client";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Share2, Menu } from "@/components/ui/icons";
import UserNav from "@/components/site/UserNav";
import { useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const { data } = useSession();
  const isLoggedIn = !!data?.user;
  const isAdmin = (data as any)?.role === "ADMIN";
  return (
    <header className="border-b bg-background/50 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-40 h-12">
            <Image
              src="/images/logohorizontal.png"
              alt="Q'hubo Mor Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="bg-black/40 hover:bg-emerald-900/40 text-white border border-white/10 hover:border-emerald-500/50 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-emerald-500/20 hover:-translate-y-0.5">
            <Link href="/links" className="flex items-center gap-2 px-4">
              <Share2 size={14} className="text-emerald-400" />
              <span className="font-medium tracking-wide">Redes</span>
            </Link>
          </Button>
          
          {!isLoggedIn && (
            <>
              <Button asChild variant="ghost" size="sm" className="bg-black/40 hover:bg-emerald-900/40 text-white border border-white/10 hover:border-emerald-500/50 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-emerald-500/20 hover:-translate-y-0.5">
                <Link href="/register" className="px-4 font-medium tracking-wide">Registro</Link>
              </Button>
              <Button asChild variant="ghost" size="sm" className="bg-black/40 hover:bg-emerald-900/40 text-white border border-white/10 hover:border-emerald-500/50 rounded-full backdrop-blur-md shadow-lg transition-all duration-300 hover:shadow-emerald-500/20 hover:-translate-y-0.5">
                <Link href="/login" className="px-4 font-medium tracking-wide">Login</Link>
              </Button>
            </>
          )}
          
          {isAdmin && <Link href="/admin" className="hover:underline font-medium text-sm">Admin</Link>}
          {isAdmin && <Link href="/admin/dashboard" className="hover:underline font-medium text-sm">Dashboard</Link>}
          
          <UserNav />
        </nav>

        {/* Mobile Navigation */}
        <div className="flex md:hidden items-center gap-2">
          <UserNav />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background/95 backdrop-blur-md">
              <DropdownMenuItem asChild>
                <Link href="/links" className="flex items-center gap-2 w-full cursor-pointer">
                  <Share2 className="h-4 w-4" />
                  <span>Redes</span>
                </Link>
              </DropdownMenuItem>
              {!isLoggedIn && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/register" className="w-full cursor-pointer">Registro</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/login" className="w-full cursor-pointer">Login</Link>
                  </DropdownMenuItem>
                </>
              )}
              {isAdmin && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="w-full cursor-pointer">Admin</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/admin/dashboard" className="w-full cursor-pointer">Dashboard</Link>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
