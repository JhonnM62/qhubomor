'use client';

import React, { useState } from 'react';
import { VentaItemFidelidad } from '@/lib/erp-client';
import { Receipt, Calendar, ShoppingBag, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface PurchaseHistoryProps {
  ventas: VentaItemFidelidad[];
  comprasTotales?: number;
  contador?: number;
}

const formatCOP = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return 'Sin fecha';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-CO', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};

export function PurchaseHistory({ ventas, comprasTotales = 0, contador = 0 }: PurchaseHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!ventas || ventas.length === 0) {
    if (comprasTotales > 0 || contador > 0) {
      const total = comprasTotales || contador;
      return (
        <div className="w-full max-w-xl lg:max-w-none mx-auto p-6 sm:p-8 rounded-3xl bg-zinc-950/80 border border-amber-500/30 text-center shadow-xl shadow-amber-500/5">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-amber-400" />
          </div>
          <h4 className="text-lg sm:text-xl font-bold text-white">
            {total} {total === 1 ? 'Compra Registrada' : 'Compras Registradas'} en el POS
          </h4>
          <p className="text-xs sm:text-sm text-zinc-400 mt-2.5 max-w-md mx-auto leading-relaxed">
            Tienes <strong className="text-amber-400 font-bold">{total} compras acumuladas</strong> que acreditan tus sellos y descuentos actuales en caja. Cada nueva compra facturada en el restaurante se desglosará automáticamente aquí con su detalle de productos.
          </p>
        </div>
      );
    }

    return (
      <div className="w-full max-w-xl lg:max-w-none mx-auto p-8 rounded-3xl bg-zinc-950/60 border border-zinc-800 text-center">
        <Receipt className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-zinc-300">Sin compras registradas aún</h4>
        <p className="text-xs sm:text-sm text-zinc-500 mt-1.5 max-w-sm mx-auto">
          Tus compras se reflejarán automáticamente en cuanto el cajero facture con tu cédula o código.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl lg:max-w-none mx-auto space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-amber-500" />
          <span>Compras Registradas en Caja</span>
        </h3>
        <span className="text-xs text-zinc-500 font-mono">
          {ventas.length} {ventas.length === 1 ? 'ticket' : 'tickets'} {comprasTotales > ventas.length ? `(de ${comprasTotales} compras)` : ''}
        </span>
      </div>

      <div className="space-y-3">
        {ventas.map((v) => {
          const isExpanded = expandedId === v.IDventas;

          return (
            <div
              key={v.IDventas}
              className="rounded-2xl sm:rounded-3xl bg-zinc-900/70 border border-zinc-800 overflow-hidden transition-all duration-200 hover:border-zinc-700 hover:bg-zinc-900/90"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : v.IDventas)}
                className="w-full p-4 sm:p-5 flex items-center justify-between text-left"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-sm sm:text-base font-bold text-white font-mono">
                      {v.pedido || 'Venta'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {v.estado || 'Pagado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{formatDate(v.fechaYHora)}</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3 sm:gap-4">
                  <div>
                    <span className="text-sm sm:text-base font-extrabold text-amber-400 block font-mono">
                      {formatCOP(v.totalInput)}
                    </span>
                    {v.compras && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Sello acumulado: #{v.compras}
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-zinc-400" />
                  )}
                </div>
              </button>

              {/* Detalle expandido de productos */}
              {isExpanded && v.productos && v.productos.length > 0 && (
                <div className="border-t border-zinc-800/80 p-4 sm:p-5 bg-black/50 space-y-2.5">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-zinc-500 block">
                    Productos del pedido
                  </span>
                  <div className="space-y-2">
                    {v.productos.map((prod, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs sm:text-sm text-zinc-300 py-1.5 border-b border-zinc-800/50 last:border-0"
                      >
                        <div className="flex items-center gap-2.5">
                          <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500" />
                          <span>
                            <strong className="text-white font-semibold">{prod.cantidad}x</strong> {prod.nombre}
                          </span>
                        </div>
                        <span className="font-mono text-zinc-300 font-semibold">
                          {formatCOP(prod.precioTotal)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
