'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { DigitalLoyaltyCard } from '@/components/fidelidad/DigitalLoyaltyCard';
import { PurchaseHistory } from '@/components/fidelidad/PurchaseHistory';
import { useFidelidadSocket } from '@/hooks/useFidelidadSocket';
import { FidelidadClienteResponse } from '@/lib/erp-client';
import {
  Search,
  Award,
  ArrowRight,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  MapPin,
} from 'lucide-react';
import { toast } from 'sonner';

export default function FidelidadPage() {
  const [identificadorInput, setIdentificadorInput] = useState('');
  const [activeIdentificador, setActiveIdentificador] = useState<string | null>(null);
  const [cliente, setCliente] = useState<FidelidadClienteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Cargar identificador guardado previamente en el dispositivo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('qhubomor_fidelidad_id');
      if (saved) {
        setIdentificadorInput(saved);
        setActiveIdentificador(saved);
      }
    }
  }, []);

  const fetchCliente = useCallback(async (id: string, isSilent = false) => {
    if (!id.trim()) return;
    if (!isSilent) setLoading(true);

    try {
      const res = await fetch(`/api/fidelidad/consultar?identificador=${encodeURIComponent(id.trim())}`);
      if (!res.ok) {
        if (res.status === 404) {
          if (!isSilent) toast.error('No se encontró cliente con esa cédula o código en el POS.');
          setCliente(null);
          return;
        }
        throw new Error('Error al consultar cliente');
      }

      const data: FidelidadClienteResponse = await res.json();
      setCliente(data);
      if (!isSilent) {
        toast.success(`Tarjeta de fidelidad cargada: ${data.nombre}`);
      }

      if (typeof window !== 'undefined') {
        localStorage.setItem('qhubomor_fidelidad_id', id.trim());
      }
    } catch {
      if (!isSilent) {
        toast.error('Error al conectar con el sistema de ventas.');
      }
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  // Consultar cuando activeIdentificador cambia
  useEffect(() => {
    if (activeIdentificador) {
      fetchCliente(activeIdentificador);
    }
  }, [activeIdentificador, fetchCliente]);

  // Manejo de eventos en tiempo real vía WebSocket
  const handleRealtimeUpdate = useCallback(
    (eventData: any) => {
      toast.success('¡Sello actualizado en caja en tiempo real!');
      if (activeIdentificador) {
        fetchCliente(activeIdentificador, true);
      } else if (eventData.contador !== undefined) {
        setCliente((prev) =>
          prev
            ? {
                ...prev,
                contador: eventData.contador,
                comprasTotales: eventData.comprasTotales ?? prev.comprasTotales,
                hito5: eventData.hito5 ?? prev.hito5,
                hito10: eventData.hito10 ?? prev.hito10,
                granizadoGratis: eventData.granizadoDisponible ?? prev.granizadoGratis,
                sellosRestantesParaGranizado: Math.max(0, 10 - eventData.contador),
              }
            : null
        );
      }
    },
    [activeIdentificador, fetchCliente]
  );

  const { isConnected } = useFidelidadSocket(
    activeIdentificador || undefined,
    handleRealtimeUpdate
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identificadorInput.trim()) {
      toast.error('Ingresa tu cédula o código de 4 dígitos.');
      return;
    }
    setActiveIdentificador(identificadorInput.trim());
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black pb-20">
      {/* Header de la sección */}
      <section className="relative px-4 pt-12 pb-6 text-center max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
          <Award className="w-4 h-4" />
          <span>Club de Fidelidad Oficial</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
          Tu Lealtad Tiene Premio
        </h1>
        <p className="text-sm text-zinc-400 mt-2 max-w-md mx-auto">
          Cada compra en el restaurante suma un sello a tu tarjeta digital. Al llegar a 10 compras, recibe tu <strong className="text-amber-400">Granizado Gratis</strong>.
        </p>

        {/* Formulario de Consulta / Búsqueda */}
        <form onSubmit={handleSubmit} className="mt-6 flex gap-2 max-w-md mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={identificadorInput}
              onChange={(e) => setIdentificadorInput(e.target.value)}
              placeholder="Ingresa Cédula o Código (ej: 4821)"
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-sm transition-colors flex items-center gap-2 shadow-lg shadow-amber-500/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Consultar'}
          </button>
        </form>
      </section>

      {/* Contenido principal */}
      <main className="px-4 max-w-md mx-auto space-y-6">
        {cliente ? (
          <>
            <DigitalLoyaltyCard
              cliente={cliente}
              isRealtimeConnected={isConnected}
            />

            {/* Acceso directo a Misiones y Google Reviews */}
            <Link
              href="/misiones"
              className="block p-4 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-amber-500/20 hover:border-amber-500/40 transition-colors group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    <MapPin className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                      <span>Misión Google Maps</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    </h4>
                    <p className="text-[11px] text-zinc-400 mt-0.5">
                      Déjanos tu reseña 5 estrellas y gana un Granizado Gratis o sellos extra.
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>

            {/* Historial de Compras Sincronizado */}
            <PurchaseHistory ventas={cliente.ultimasVentas} />
          </>
        ) : !loading && activeIdentificador ? (
          <div className="p-6 rounded-2xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
            <ShieldAlert className="w-8 h-8 text-amber-400 mx-auto" />
            <h3 className="text-base font-bold text-white">Cliente no encontrado</h3>
            <p className="text-xs text-zinc-400">
              No encontramos registros con el identificador &quot;{activeIdentificador}&quot;. Solicita al cajero que te registre con tu cédula en tu próxima visita.
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}
