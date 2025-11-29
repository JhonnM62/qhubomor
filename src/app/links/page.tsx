"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Facebook, Instagram, Music, MessageCircle, Globe } from "@/components/ui/icons";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface SiteConfig {
  siteName: string;
  description: string;
  logoUrl: string;
  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  whatsappUrl: string;
  websiteUrl: string;
}

export default function LinksPage() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/site-config")
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
          <CardHeader className="flex flex-col items-center space-y-4 pb-6">
            <Skeleton className="w-24 h-24 rounded-full" />
            <div className="space-y-2 text-center w-full">
              <Skeleton className="h-8 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-1/2 mx-auto" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="w-full h-14 rounded-md" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  const socialLinks = [
    {
      name: "Facebook",
      url: config?.facebookUrl,
      icon: <Facebook className="w-6 h-6" />,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Instagram",
      url: config?.instagramUrl,
      icon: <Instagram className="w-6 h-6" />,
      color: "bg-pink-600 hover:bg-pink-700",
    },
    {
      name: "TikTok",
      url: config?.tiktokUrl,
      icon: <Music className="w-6 h-6" />,
      color: "bg-black hover:bg-gray-900",
    },
    {
      name: "WhatsApp",
      url: config?.whatsappUrl,
      icon: <MessageCircle className="w-6 h-6" />,
      color: "bg-green-500 hover:bg-green-600",
    },
    {
      name: "Sitio Web Oficial",
      url: config?.websiteUrl || "/",
      icon: <Globe className="w-6 h-6" />,
      color: "bg-purple-600 hover:bg-purple-700",
    },
  ].filter(link => link.url); // Only show links that have a URL configured

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-900 dark:to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <CardHeader className="flex flex-col items-center space-y-4 pb-6">
          <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
            <AvatarImage src={config?.logoUrl || "/images/logo.png"} alt={config?.siteName || "Logo"} />
            <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
              {config?.siteName ? config.siteName.charAt(0).toUpperCase() : "Q"}
            </AvatarFallback>
          </Avatar>
          <div className="text-center space-y-1">
            <CardTitle className="text-2xl font-bold tracking-tight">{config?.siteName || "Q'hubo Mor"}</CardTitle>
            <CardDescription className="text-base font-medium text-muted-foreground">
              {config?.description || "¡Síguenos en nuestras redes sociales!"}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {socialLinks.length > 0 ? (
            socialLinks.map((link) => (
              <Button
                key={link.name}
                asChild
                className={`w-full h-14 text-lg font-semibold transition-all duration-300 hover:scale-105 shadow-md ${link.color} text-white border-none`}
              >
                <Link href={link.url!} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3">
                  {link.icon}
                  <span>{link.name}</span>
                </Link>
              </Button>
            ))
          ) : (
            <p className="text-center text-muted-foreground">No hay redes sociales configuradas aún.</p>
          )}
          
          <div className="pt-6 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} {config?.siteName || "Q'hubo Mor"}. Todos los derechos reservados.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
