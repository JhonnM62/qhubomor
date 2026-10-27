'use client';

import React from 'react';
import { Star, Award, Check, Sparkles } from 'lucide-react';

interface StampGridProps {
  contador: number; // 0 a 10
}

export function StampGrid({ contador }: StampGridProps) {
  const currentStamps = Math.min(Math.max(contador, 0), 10);

  return (
    <div className="w-full">
      {/* Indicador superior */}
      <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
        <span>Progreso del ciclo</span>
        <span className="text-amber-400">{currentStamps} de 10 sellos</span>
      </div>

      {/* Cuadrícula de 10 sellos (2 filas de 5) */}
      <div className="grid grid-cols-5 gap-2 sm:gap-3">
        {Array.from({ length: 10 }).map((_, idx) => {
          const stampNumber = idx + 1;
          const isMarked = stampNumber <= currentStamps;
          const isMilestone5 = stampNumber === 5;
          const isMilestone10 = stampNumber === 10;

          // Clases dinámicas según estado e hito
          let cardStyle = 'border-zinc-800 bg-zinc-900/60 text-zinc-600';
          if (isMarked) {
            if (isMilestone10) {
              cardStyle =
                'border-amber-400 bg-gradient-to-br from-amber-500 to-orange-600 text-black shadow-lg shadow-amber-500/30 scale-105';
            } else if (isMilestone5) {
              cardStyle =
                'border-amber-400 bg-gradient-to-br from-amber-500/30 to-amber-600/20 text-amber-300 shadow-md shadow-amber-500/20';
            } else {
              cardStyle =
                'border-amber-500/40 bg-zinc-900 text-amber-400 shadow-sm shadow-amber-500/10';
            }
          } else {
            if (isMilestone10) {
              cardStyle = 'border-amber-500/30 border-dashed bg-zinc-900/40 text-amber-400/60';
            } else if (isMilestone5) {
              cardStyle = 'border-zinc-700 border-dashed bg-zinc-900/40 text-zinc-500';
            }
          }

          return (
            <div
              key={stampNumber}
              className={`relative flex flex-col items-center justify-center rounded-xl p-2 sm:p-3 border transition-all duration-300 min-h-[72px] sm:min-h-[84px] ${cardStyle}`}
            >
              {/* Número del sello */}
              <span className="text-[10px] sm:text-xs font-mono font-bold mb-1 opacity-70">
                #{stampNumber}
              </span>

              {/* Icono del sello */}
              <div className="flex items-center justify-center my-0.5">
                {isMilestone10 ? (
                  isMarked ? (
                    <Sparkles className="w-6 h-6 animate-pulse" />
                  ) : (
                    <Award className="w-5 h-5 text-amber-400/70" />
                  )
                ) : isMilestone5 ? (
                  <Star className={`w-5 h-5 ${isMarked ? 'fill-current' : ''}`} />
                ) : isMarked ? (
                  <Check className="w-5 h-5 stroke-[3]" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-800 border border-zinc-700" />
                )}
              </div>

              {/* Etiqueta de hito */}
              {isMilestone5 && (
                <span className="text-[9px] font-bold text-center leading-tight mt-1">
                  15% OFF
                </span>
              )}
              {isMilestone10 && (
                <span className="text-[9px] font-extrabold text-center leading-tight mt-1 tracking-tight">
                  GRATIS
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Leyenda explicativa inferior */}
      <div className="mt-3 flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2.5">
        <div className="flex items-center gap-1.5">
          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
          <span>Sello 5: 15% Descuento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Award className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-amber-300">Sello 10: Granizado Gratis</span>
        </div>
      </div>
    </div>
  );
}
