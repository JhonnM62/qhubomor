'use client';

import React, { useState } from 'react';
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  Award,
  ArrowRight,
  X,
  Copy,
  Check,
  Gift,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export interface VinculacionResultData {
  encontrado: boolean;
  codigoPos: number | string;
  identificador: string;
  nombre?: string;
  contador?: number;
  comprasTotales?: number;
  message?: string;
}

interface VinculacionResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: VinculacionResultData | null;
}

export function VinculacionResultModal({
  isOpen,
  onClose,
  data,
}: VinculacionResultModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const isEncontrado = Boolean(data.encontrado);
  const contador = Number(data.contador || 0);
  const codigo = String(data.codigoPos || '------');
  const esWhatsapp = data.identificador.length >= 10 && data.identificador.startsWith('3');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codigo);
    setCopied(true);
    toast.success('¡Código copiado al portapapeles!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className={`relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-zinc-950 border-2 text-left shadow-2xl overflow-hidden space-y-5 animate-in zoom-in-95 duration-200 ${
          isEncontrado
            ? 'border-amber-500/60 shadow-amber-500/25'
            : 'border-emerald-500/50 shadow-emerald-500/20'
        }`}
      >
        {/* Resplandores de fondo */}
        {isEncontrado ? (
          <>
            <div className="absolute -top-24 -right-24 w-52 h-52 bg-amber-500/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />
          </>
        ) : (
          <>
            <div className="absolute -top-24 -right-24 w-52 h-52 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-52 h-52 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          </>
        )}

        {/* Botón cerrar X */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Cabecera dinámica según resultado */}
        <div className="flex items-center gap-3.5">
          {isEncontrado ? (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-yellow-600/30 border-2 border-amber-500/60 flex items-center justify-center text-amber-400 shrink-0 shadow-lg shadow-amber-500/25">
              <Trophy className="w-7 h-7 text-amber-400" />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500/30 to-teal-600/30 border-2 border-emerald-500/60 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/25">
              <CheckCircle2 className="w-7 h-7 text-emerald-400" />
            </div>
          )}

          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold tracking-wider uppercase border mb-1 bg-zinc-900/90 text-zinc-300 border-zinc-700">
              {isEncontrado ? (
                <>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span className="text-amber-400">Historial Previo Encontrado</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Dato Registrado Exitosamente</span>
                </>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
              {isEncontrado
                ? '¡Puntos Anteriores Recuperados!'
                : '¡Número Vinculado con Éxito!'}
            </h3>
          </div>
        </div>

        {/* Mensaje explicativo */}
        <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
          {isEncontrado ? (
            <>
              ¡Excelente noticia! Hemos localizado tu historial de pedidos en el restaurante y{' '}
              <strong className="text-amber-400 font-bold">
                unificado tus sellos y compras anteriores
              </strong>{' '}
              con tu cuenta oficial.
            </>
          ) : (
            <>
              No se encontraron pedidos anteriores en la base de datos con este número.{' '}
              <strong className="text-emerald-400 font-bold">
                Sin embargo, lo hemos guardado en tu cuenta
              </strong>{' '}
              para que a partir de hoy sumes sellos en cada compra.
            </>
          )}
        </p>

        {/* Tarjeta destacada con Código POS y Detalle */}
        <div
          className={`p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border text-center space-y-3 ${
            isEncontrado ? 'border-amber-500/40' : 'border-zinc-800'
          }`}
        >
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-zinc-400 block mb-1">
              {isEncontrado ? 'Tu Código POS Oficial Asignado' : 'Tu Código POS Asignado'}
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight">
                #{codigo}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
                title="Copiar código POS"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Grilla con Datos Clave */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800 text-left">
            <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                {esWhatsapp ? 'WhatsApp' : 'Identificación'}
              </span>
              <span className="text-xs font-mono font-bold text-zinc-200 truncate block mt-0.5">
                {data.identificador}
              </span>
            </div>

            <div className="p-2 rounded-xl bg-zinc-950/70 border border-zinc-800/80">
              <span className="text-[10px] uppercase font-bold text-zinc-500 block">
                Balance de Sellos
              </span>
              <span className="text-xs font-mono font-bold text-amber-400 block mt-0.5">
                {contador} / 10 Sellos
              </span>
            </div>
          </div>

          {/* Banner de Estado de Sellos */}
          {isEncontrado && contador > 0 ? (
            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium flex items-center justify-center gap-1.5">
              <Award className="w-4 h-4 text-amber-400 shrink-0" />
              <span>
                {contador >= 10
                  ? '¡Tienes un Granizado Gratis disponible para reclamar!'
                  : contador >= 5
                  ? `¡Tienes 15% de descuento activo! Faltan ${10 - contador} para Granizado Gratis.`
                  : `¡${contador} sellos transferidos! Faltan ${5 - contador} para el 15% de desc.`}
              </span>
            </div>
          ) : (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-medium flex items-center justify-center gap-1.5">
              <Gift className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Menciona tu código o número en tu próximo pedido para ganar tu primer sello.
              </span>
            </div>
          )}
        </div>

        {/* Botón de acción principal */}
        <button
          type="button"
          onClick={onClose}
          className={`w-full py-3.5 px-4 rounded-xl font-black text-xs sm:text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer ${
            isEncontrado
              ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/25'
              : 'bg-emerald-500 hover:bg-emerald-400 text-black shadow-emerald-500/25'
          }`}
        >
          <span>
            {isEncontrado ? '¡Genial! Ver Mis Sellos Acumulados' : '¡Entendido! Ver Mi Tarjeta Digital'}
          </span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
