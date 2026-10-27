'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Star,
  Award,
  UploadCloud,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

interface Proof {
  platform: string;
  screenshotPath: string;
  verified: boolean;
  createdAt: string;
}

export default function MisionesPage() {
  const [proofs, setProofs] = useState<Record<string, Proof>>({});
  const [loading, setLoading] = useState(true);
  const [uploadingPlatform, setUploadingPlatform] = useState<string | null>(null);

  const fetchProofs = async () => {
    try {
      const res = await fetch('/api/social');
      if (res.ok) {
        const data = await res.json();
        const map: Record<string, Proof> = {};
        (data.proofs || []).forEach((p: Proof) => {
          map[p.platform] = p;
        });
        setProofs(map);
      }
    } catch {
      // Ignorar si no está autenticado
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
  }, []);

  const handleFileUpload = async (platform: string, file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona una imagen válida.');
      return;
    }

    setUploadingPlatform(platform);

    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const imageBase64 = await base64Promise;

      const res = await fetch('/api/social', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform, imageBase64 }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          toast.error('Inicia sesión para registrar tus comprobantes.');
          return;
        }
        throw new Error('Error al subir comprobante');
      }

      toast.success('Captura enviada correctamente. El equipo la revisará en caja.');
      await fetchProofs();
    } catch {
      toast.error('Error al subir el comprobante. Intenta nuevamente.');
    } finally {
      setUploadingPlatform(null);
    }
  };

  const googleMapsUrl =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ||
    "https://www.google.com/maps/search/?api=1&query=Q'hubo+Mor";

  const renderStatusBadge = (platform: string) => {
    const proof = proofs[platform];
    if (!proof) return null;

    if (proof.verified) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Verificado</span>
        </span>
      );
    }

    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <Clock className="w-3.5 h-3.5" />
        <span>En revisión por caja</span>
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black pb-24">
      {/* Header */}
      <header className="px-4 pt-8 pb-4 max-w-lg mx-auto flex items-center justify-between border-b border-zinc-900">
        <Link
          href="/fidelidad"
          className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver a Tarjeta</span>
        </Link>
        <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase">
          Misiones & Recompensas
        </span>
      </header>

      <main className="px-4 pt-6 max-w-lg mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Desbloquea Premios
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Apóyanos en Google y redes sociales. Sube tu comprobante y reclama tu recompensa en tu próxima visita.
          </p>
        </div>

        {/* ========================================================= */}
        {/* MISIÓN PRINCIPAL: GOOGLE MAPS ⭐⭐⭐⭐⭐ */}
        {/* ========================================================= */}
        <section className="relative rounded-3xl p-6 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/20 border border-amber-500/30 shadow-xl shadow-amber-500/5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <MapPin className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                  Misión Destacada
                </span>
                <h2 className="text-lg font-extrabold text-white">
                  Reseña 5 Estrellas en Google
                </h2>
              </div>
            </div>
            {renderStatusBadge('GOOGLE_REVIEW')}
          </div>

          {/* Recompensa */}
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <strong className="text-amber-300 block">
                Premio: 1 Granizado 8oz Gratis
              </strong>
              <span className="text-zinc-400 text-[11px]">
                O +1 sello directo a tu tarjeta de fidelidad al ser verificado.
              </span>
            </div>
          </div>

          {/* Estrellas decorativas */}
          <div className="flex items-center gap-1 text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-amber-400" />
            ))}
            <span className="text-xs text-zinc-400 ml-2">Calificación requerida</span>
          </div>

          {/* Botón para abrir Google Maps */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs transition-colors flex items-center justify-center gap-2 shadow-md shadow-amber-500/20"
          >
            <span>Abrir Google Maps para calificar</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          {/* Zona de subida de captura */}
          <div className="pt-2 border-t border-zinc-800/80">
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Sube la captura de tu reseña publicada
            </label>

            <div className="relative border border-dashed border-zinc-700 hover:border-amber-500 rounded-2xl p-5 text-center transition-colors bg-zinc-950/60 cursor-pointer">
              <input
                type="file"
                accept="image/*"
                disabled={uploadingPlatform === 'GOOGLE_REVIEW'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload('GOOGLE_REVIEW', file);
                }}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />

              {uploadingPlatform === 'GOOGLE_REVIEW' ? (
                <div className="flex items-center justify-center gap-2 text-xs text-amber-400">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Subiendo captura...</span>
                </div>
              ) : proofs['GOOGLE_REVIEW'] ? (
                <div className="flex items-center justify-center gap-2 text-xs text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Captura registrada. Puedes hacer clic para actualizarla.</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-zinc-400">
                  <Camera className="w-6 h-6 text-zinc-500" />
                  <span className="text-xs font-medium">
                    Haz clic aquí para seleccionar o tomar la captura
                  </span>
                  <span className="text-[10px] text-zinc-600">JPG, PNG o WebP</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* MISIONES SECUNDARIAS: REDES SOCIALES */}
        {/* ========================================================= */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>Síguenos en Redes Sociales</span>
            </h3>
            <span className="text-[11px] text-zinc-500">+1 Sello cada una</span>
          </div>

          {/* Instagram */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Instagram</h4>
                <p className="text-xs text-zinc-400">@qhubomor</p>
              </div>
              {renderStatusBadge('INSTAGRAM')}
            </div>

            <div className="flex gap-2">
              <a
                href={process.env.NEXT_PUBLIC_INSTAGRAM_URL || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
              >
                <span>Seguir perfil</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <label className="relative px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingPlatform === 'INSTAGRAM'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('INSTAGRAM', file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{uploadingPlatform === 'INSTAGRAM' ? 'Subiendo...' : 'Subir captura'}</span>
              </label>
            </div>
          </div>

          {/* TikTok */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">TikTok</h4>
                <p className="text-xs text-zinc-400">@qhubomor</p>
              </div>
              {renderStatusBadge('TIKTOK')}
            </div>

            <div className="flex gap-2">
              <a
                href={process.env.NEXT_PUBLIC_TIKTOK_URL || 'https://tiktok.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
              >
                <span>Seguir perfil</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <label className="relative px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingPlatform === 'TIKTOK'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('TIKTOK', file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{uploadingPlatform === 'TIKTOK' ? 'Subiendo...' : 'Subir captura'}</span>
              </label>
            </div>
          </div>

          {/* Facebook */}
          <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Facebook</h4>
                <p className="text-xs text-zinc-400">Qhubo Mor Oficial</p>
              </div>
              {renderStatusBadge('FACEBOOK')}
            </div>

            <div className="flex gap-2">
              <a
                href={process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold text-center flex items-center justify-center gap-1.5 transition-colors border border-zinc-700"
              >
                <span>Seguir página</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>

              <label className="relative px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  disabled={uploadingPlatform === 'FACEBOOK'}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload('FACEBOOK', file);
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-3.5 h-3.5" />
                <span>{uploadingPlatform === 'FACEBOOK' ? 'Subiendo...' : 'Subir captura'}</span>
              </label>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
