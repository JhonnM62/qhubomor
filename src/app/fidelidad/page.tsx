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
  CheckCircle2,
  Gift,
  Star,
  Zap,
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
    <div className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black pb-24">
      {/* Header de la sección */}
      <section className="relative px-4 pt-10 sm:pt-16 pb-8 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-4 shadow-sm shadow-amber-500/10">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Club de Fidelidad Oficial Q&apos;hubo Mor</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
          Tu Lealtad Tiene <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500">Premio</span>
        </h1>
        <p className="text-sm sm:text-base text-zinc-400 mt-3 max-w-2xl mx-auto leading-relaxed">
          Cada visita y compra en el restaurante suma un sello a tu tarjeta digital. Al acumular 10 sellos recibes tu <strong className="text-amber-400 font-bold">Granizado de 8oz Gratis</strong>.
        </p>

        {/* Formulario de Consulta / Búsqueda */}
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={identificadorInput}
              onChange={(e) => setIdentificadorInput(e.target.value)}
              placeholder="Ingresa Cédula o Código (ej: 50934)"
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-sm sm:text-base text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-sm sm:text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Consultar Tarjeta'}
          </button>
        </form>
      </section>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {cliente ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Columna Izquierda: Tarjeta Digital VIP y Acceso a Misiones */}
            <div className="lg:col-span-5 space-y-6">
              <DigitalLoyaltyCard
                cliente={cliente}
                isRealtimeConnected={isConnected}
              />

              {/* Acceso directo a Misiones y Google Reviews */}
              <Link
                href="/misiones"
                className="block p-5 rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 border border-amber-500/20 hover:border-amber-500/40 transition-all duration-200 group shadow-xl shadow-amber-500/5 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      <MapPin className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <span>Misión Google Maps</span>
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      </h4>
                      <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                        Califícanos con 5 estrellas y gana un Granizado Gratis o sellos extra en tu próxima visita.
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                </div>
              </Link>

              {/* Beneficios Privilege Resumen */}
              <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950/70 border border-zinc-800/80 space-y-3.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Beneficios del Club Q&apos;hubo Mor</span>
                </h4>
                <ul className="text-xs text-zinc-400 space-y-2.5">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong className="text-zinc-200">Sello 5:</strong> Desbloqueas un 15% de descuento en tu consumo.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span><strong className="text-zinc-200">Sello 10:</strong> Granizado de 8oz totalmente de cortesía.</span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <span><strong className="text-zinc-200">Sincronización en vivo:</strong> Cada orden facturada en caja actualiza tus sellos al instante vía POS.</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Columna Derecha: Historial de Compras Sincronizado */}
            <div className="lg:col-span-7 space-y-6">
              <PurchaseHistory
                ventas={cliente.ultimasVentas}
                comprasTotales={cliente.comprasTotales}
                contador={cliente.contador}
              />
            </div>
          </div>
        ) : !loading && activeIdentificador ? (
          <div className="max-w-md mx-auto p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-4">
            <ShieldAlert className="w-10 h-10 text-amber-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Cliente no encontrado</h3>
            <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
              No encontramos registros con el identificador &quot;{activeIdentificador}&quot;. Solicita al cajero que te registre con tu número de cédula en tu próxima visita para empezar a acumular sellos.
            </p>
            <button
              onClick={() => {
                setActiveIdentificador(null);
                setIdentificadorInput('');
              }}
              className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
            >
              Probar con otro código
            </button>
          </div>
        ) : (
          /* Estado Inicial: Explicación de cómo funciona el Club */
          <div className="py-6 space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                ¿Cómo funciona tu Tarjeta Digital?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Sin tarjetas de papel que se pierden o se dañan. Tu cuenta está 100% conectada a nuestro sistema de facturación.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Zap className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">1. Dicta tu Cédula o Código</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Al pagar tu pedido en el restaurante, proporciona tu número al cajero. El sistema sumará tu sello automáticamente.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Star className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">2. Sello 5: 15% Descuento</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  A mitad de camino en tu ciclo de lealtad, recibe un 15% de descuento inmediato aplicable a tu consumo.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Gift className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">3. Sello 10: Granizado Gratis</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Completa tu tarjeta de 10 sellos y disfruta tu Granizado de 8oz sin costo. ¡Luego reinicias para volver a ganar!
                </p>
              </div>
            </div>

            {/* Banner de llamada a Misiones */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Misiones y Premios Adicionales
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-white">
                  ¿Quieres ganar un Granizado Gratis hoy mismo?
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg">
                  Déjanos tu reseña 5 estrellas en Google Maps y sube tu comprobante para redimirlo en el punto de venta.
                </p>
              </div>
              <Link
                href="/misiones"
                className="px-6 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 shrink-0 flex items-center gap-2"
              >
                <span>Ver Misiones Disponibles</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
