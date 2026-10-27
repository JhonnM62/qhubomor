'use client';

import React, { useState } from 'react';
import { VentaItemFidelidad } from '@/lib/erp-client';
import { Receipt, Calendar, ShoppingBag, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';

interface PurchaseHistoryProps {
  ventas: VentaItemFidelidad[];
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

export function PurchaseHistory({ ventas }: PurchaseHistoryProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (!ventas || ventas.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-center">
        <Receipt className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
        <h4 className="text-sm font-semibold text-zinc-300">Sin compras registradas aún</h4>
        <p className="text-xs text-zinc-500 mt-1">
          Tus compras se reflejarán automáticamente en cuanto el cajero facture con tu cédula o código.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
          <Receipt className="w-4 h-4 text-amber-500" />
          <span>Compras Registradas en Caja</span>
        </h3>
        <span className="text-xs text-zinc-500">Últimas {ventas.length}</span>
      </div>

      <div className="space-y-2.5">
        {ventas.map((v) => {
          const isExpanded = expandedId === v.IDventas;

          return (
            <div
              key={v.IDventas}
              className="rounded-2xl bg-zinc-900/70 border border-zinc-800 overflow-hidden transition-colors hover:border-zinc-700"
            >
              <button
                type="button"
                onClick={() => setExpandedId(isExpanded ? null : v.IDventas)}
                className="w-full p-4 flex items-center justify-between text-left"
              >
                <div className="flex-1 pr-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white font-mono">
                      {v.pedido || 'Venta'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="w-3 h-3" />
                      {v.estado || 'Pagado'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <Calendar className="w-3 h-3 text-zinc-500" />
                    <span>{formatDate(v.fechaYHora)}</span>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="text-sm font-extrabold text-amber-400 block">
                      {formatCOP(v.totalInput)}
                    </span>
                    {v.compras && (
                      <span className="text-[10px] text-zinc-500 font-mono">
                        Sello acumulado: #{v.compras}
                      </span>
                    )}
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-zinc-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-500" />
                  )}
                </div>
              </button>

              {/* Detalle expandido de productos */}
              {isExpanded && v.productos && v.productos.length > 0 && (
                <div className="border-t border-zinc-800/80 p-3.5 bg-black/40 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 block">
                    Productos del pedido
                  </span>
                  <div className="space-y-1.5">
                    {v.productos.map((prod, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between text-xs text-zinc-300"
                      >
                        <div className="flex items-center gap-2">
                          <ShoppingBag className="w-3.5 h-3.5 text-zinc-500" />
                          <span>
                            {prod.cantidad}x {prod.nombre}
                          </span>
                        </div>
                        <span className="font-mono text-zinc-400">
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
