"use client";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

export default function UserNav() {
  const { data, status } = useSession();
  if (status !== "authenticated" || !data?.user) return null;
  const img = data.user.image as string | undefined;
  const name = (data.user.name as string | undefined) || "U";
  const initial = name?.[0]?.toUpperCase() || "U";
  return (
    <Link href="/profile" className="relative inline-flex items-center">
      <Avatar className="h-8 w-8 ring-2 ring-transparent hover:ring-primary transition">
        <AvatarImage src={img} alt="avatar" />
        <AvatarFallback>{initial}</AvatarFallback>
      </Avatar>
    </Link>
  );
}
