'use client';

import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { StampGrid } from './StampGrid';
import { FidelidadClienteResponse } from '@/lib/erp-client';
import {
  Sparkles,
  QrCode,
  ShieldCheck,
  Award,
  Zap,
  CheckCircle2,
  Copy,
  Check,
} from 'lucide-react';

interface DigitalLoyaltyCardProps {
  cliente: FidelidadClienteResponse;
  isRealtimeConnected?: boolean;
}

export function DigitalLoyaltyCard({
  cliente,
  isRealtimeConnected = false,
}: DigitalLoyaltyCardProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const qrData = JSON.stringify({
    tipo: 'FIDELIDAD_QHUBO',
    clienteId: cliente.IDcliente,
    cedula: cliente.cedula,
    contador: cliente.contador,
  });

  const handleCopyCode = () => {
    navigator.clipboard.writeText(String(cliente.cedula || cliente.IDcliente));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Tarjeta Virtual Obsidian / Gold */}
      <div className="relative rounded-3xl p-6 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-amber-500/30 shadow-2xl shadow-amber-500/10 overflow-hidden">
        {/* Resplandor decorativo de fondo */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header de la tarjeta */}
        <div className="relative z-10 flex items-start justify-between mb-5 border-b border-zinc-800/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
                Q&apos;hubo Mor Privilege
              </span>
              {isRealtimeConnected && (
                <span
                  title="Conectado en vivo con el POS"
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  En vivo
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight mt-0.5">
              {cliente.nombre}
            </h2>
          </div>

          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Datos identificadores (Cédula y Código) */}
        <div className="relative z-10 grid grid-cols-2 gap-3 mb-5 p-3 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
          <div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 block">
              Cédula
            </span>
            <span className="text-sm font-mono font-bold text-zinc-200">
              {cliente.cedula || 'No registrada'}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 block">
              Código Caja
            </span>
            <span className="text-sm font-mono font-bold text-amber-400">
              #{cliente.IDcliente}
            </span>
          </div>
        </div>

        {/* Cuadrícula de 10 Sellos */}
        <div className="relative z-10 mb-5">
          <StampGrid contador={cliente.contador} />
        </div>

        {/* Banner de Estado / Recompensa Activa */}
        <div className="relative z-10 mb-5">
          {cliente.granizadoGratis ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 text-black flex items-center gap-3 shadow-lg shadow-amber-500/20">
              <Award className="w-6 h-6 shrink-0" />
              <div className="flex-1">
                <span className="text-xs font-black uppercase tracking-wider block">
                  Granizado Gratis Disponible
                </span>
                <span className="text-[11px] font-medium leading-tight block">
                  ¡Ciclo completado! Muestra esta pantalla en caja para reclamar tu premio.
                </span>
              </div>
            </div>
          ) : cliente.hito5 ? (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-3">
              <Sparkles className="w-5 h-5 shrink-0 text-amber-400" />
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider block text-amber-200">
                  Hito 5 Alcanzado: 15% Descuento
                </span>
                <span className="text-[11px] text-zinc-400 leading-tight block">
                  Faltan {cliente.sellosRestantesParaGranizado} compras para tu Granizado Gratis.
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-zinc-400 flex items-center gap-3">
              <Zap className="w-5 h-5 shrink-0 text-amber-400" />
              <span className="text-xs">
                Faltan <strong className="text-zinc-200">{cliente.sellosRestantesParaGranizado} compras</strong> para tu Granizado Gratis.
              </span>
            </div>
          )}
        </div>

        {/* Botón para mostrar código QR al cajero */}
        <div className="relative z-10 flex gap-2">
          <button
            onClick={() => setShowQrModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
          >
            <QrCode className="w-4 h-4" />
            <span>Mostrar QR en Caja</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
            title="Copiar código para dictar"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Modal QR en Pantalla Completa para Escaneo en Caja */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-3xl p-6 bg-zinc-950 border border-amber-500/30 text-center shadow-2xl">
            <h3 className="text-lg font-extrabold text-white mb-1">
              Escanea en el Punto de Venta
            </h3>
            <p className="text-xs text-zinc-400 mb-5">
              Presenta este código al cajero para registrar tu compra o canjear tus premios.
            </p>

            <div className="bg-white p-4 rounded-2xl inline-block shadow-inner mb-4">
              <QRCodeSVG value={qrData} size={180} level="M" />
            </div>

            <div className="bg-zinc-900 rounded-xl p-3 mb-5 border border-zinc-800 text-left">
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Cliente:</span>
                <strong className="text-zinc-200">{cliente.nombre}</strong>
              </div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Cédula:</span>
                <strong className="text-zinc-200 font-mono">{cliente.cedula || 'N/A'}</strong>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Código Caja:</span>
                <strong className="text-amber-400 font-mono">#{cliente.IDcliente}</strong>
              </div>
            </div>

            <button
              onClick={() => setShowQrModal(false)}
              className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs border border-zinc-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
