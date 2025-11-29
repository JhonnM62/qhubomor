"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Facebook, Instagram, Music, MessageCircle, Globe, Upload, Image as ImageIcon } from "@/components/ui/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import QrCodeGenerator from "@/components/ui/QrCodeGenerator";

export default function SiteSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [config, setConfig] = useState({
    siteName: "",
    description: "",
    logoUrl: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    whatsappUrl: "",
    websiteUrl: "",
  });

  useEffect(() => {
    fetch("/api/admin/site-config")
      .then((res) => res.json())
      .then((data) => {
        if (data) setConfig(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Error cargando configuración");
        setLoading(false);
      });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Error al subir imagen");

      const data = await res.json();
      setConfig((prev) => ({ ...prev, logoUrl: data.url }));
      toast.success("Logo subido correctamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al subir el logo");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/admin/site-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });

      if (!res.ok) throw new Error("Error al guardar");

      toast.success("Configuración guardada exitosamente");
    } catch (error) {
      console.error(error);
      toast.error("Error al guardar la configuración");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Cargando configuración...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Configuración del Sitio</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Configura los detalles principales que aparecen en la página de enlaces.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-2">
                <Label htmlFor="siteName">Nombre del Sitio</Label>
                <Input 
                  id="siteName" 
                  name="siteName" 
                  value={config.siteName || ""} 
                  onChange={handleChange} 
                  placeholder="Q'hubo Mor"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Descripción</Label>
                <Input 
                  id="description" 
                  name="description" 
                  value={config.description || ""} 
                  onChange={handleChange} 
                  placeholder="¡Síguenos en nuestras redes sociales!"
                />
              </div>
              
              <div className="grid gap-4 border rounded-lg p-4 bg-muted/20">
                <Label className="text-base">Logo del Sitio</Label>
                <div className="flex items-center gap-6">
                  <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                    <AvatarImage src={config.logoUrl || "/images/logo.png"} alt="Logo Preview" />
                    <AvatarFallback className="text-2xl font-bold">Q</AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2 flex-1">
                    <div className="flex gap-2">
                      <Button 
                        type="button" 
                        variant="secondary" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          "Subiendo..." 
                        ) : (
                          <>
                            <Upload className="mr-2" /> Subir Logo
                          </>
                        )}
                      </Button>
                      <Input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleFileUpload}
                      />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      <p>Sube una imagen cuadrada (PNG, JPG) para usar como logo.</p>
                      <p>Si prefieres usar una URL externa, pégala abajo:</p>
                    </div>
                    <div className="relative">
                      <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                      <Input 
                        name="logoUrl" 
                        value={config.logoUrl || ""} 
                        onChange={handleChange} 
                        className="pl-10"
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Redes Sociales</CardTitle>
              <CardDescription>Gestiona los enlaces a tus redes sociales.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Facebook className="text-blue-600" /> Facebook URL
                </Label>
                <Input 
                  name="facebookUrl" 
                  value={config.facebookUrl || ""} 
                  onChange={handleChange} 
                  placeholder="https://facebook.com/..."
                />
              </div>
              
              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Instagram className="text-pink-600" /> Instagram URL
                </Label>
                <Input 
                  name="instagramUrl" 
                  value={config.instagramUrl || ""} 
                  onChange={handleChange} 
                  placeholder="https://instagram.com/..."
                />
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Music className="text-black dark:text-white" /> TikTok URL
                </Label>
                <Input 
                  name="tiktokUrl" 
                  value={config.tiktokUrl || ""} 
                  onChange={handleChange} 
                  placeholder="https://tiktok.com/@..."
                />
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <MessageCircle className="text-green-500" /> WhatsApp URL
                </Label>
                <Input 
                  name="whatsappUrl" 
                  value={config.whatsappUrl || ""} 
                  onChange={handleChange} 
                  placeholder="https://wa.me/..."
                />
              </div>

              <div className="grid gap-2">
                <Label className="flex items-center gap-2">
                  <Globe className="text-purple-600" /> Sitio Web Oficial
                </Label>
                <Input 
                  name="websiteUrl" 
                  value={config.websiteUrl || ""} 
                  onChange={handleChange} 
                  placeholder="https://..."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Código QR de la Página</CardTitle>
              <CardDescription>Este código QR dirige a la página de enlaces. Puedes descargarlo para imprimirlo.</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-6">
              <QrCodeGenerator 
                value="https://qhubomor.com/links" 
                size={200} 
                showDownload={true} 
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button type="submit" disabled={saving} size="lg">
              {saving ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
