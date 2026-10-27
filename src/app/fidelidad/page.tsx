'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
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
  Copy,
  Check,
  X,
  ShieldCheck,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from 'sonner';

function FidelidadContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const esAdmin = (session as any)?.role === 'ADMIN';

  const [identificadorInput, setIdentificadorInput] = useState('');
  const [activeIdentificador, setActiveIdentificador] = useState<string | null>(null);
  const [cliente, setCliente] = useState<FidelidadClienteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal de bienvenida al iniciar sesión o registrarse
  const [showBienvenida, setShowBienvenida] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // 1. Sincronizar automáticamente el usuario con el ERP al estar logeado
  useEffect(() => {
    async function syncClienteConErp() {
      if (status === 'authenticated' && session?.user?.email) {
        const codigoEnSesion = (session as any).codigoCliente;
        if (codigoEnSesion) {
          setCodigoGenerado(Number(codigoEnSesion));
          setActiveIdentificador(String(codigoEnSesion));
          setIdentificadorInput(String(codigoEnSesion));
          if (typeof window !== 'undefined') {
            localStorage.setItem('qhubomor_fidelidad_id', String(codigoEnSesion));
          }
          return;
        }

        // Si no vino en la sesión aún, sincronizarlo vía API
        try {
          const res = await fetch('/api/fidelidad/sincronizar-usuario', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: session.user.email,
              nombre: session.user.name || undefined,
            }),
          });
          const data = await res.json();
          if (data.success && data.cliente?.IDcliente) {
            const id = data.cliente.IDcliente;
            setCodigoGenerado(id);
            setActiveIdentificador(String(id));
            setIdentificadorInput(String(id));
            if (typeof window !== 'undefined') {
              localStorage.setItem('qhubomor_fidelidad_id', String(id));
            }
          }
        } catch (e) {
          console.error('Error al sincronizar cliente en fidelidad:', e);
        }
      }
    }

    syncClienteConErp();
  }, [status, session]);

  // 2. Activar modal de bienvenida si el query param es ?bienvenida=true
  useEffect(() => {
    if (searchParams?.get('bienvenida') === 'true') {
      setShowBienvenida(true);
    }
  }, [searchParams]);

  // 3. Cargar identificador guardado previamente si no hay usuario activo
  useEffect(() => {
    if (typeof window !== 'undefined' && !activeIdentificador) {
      const saved = localStorage.getItem('qhubomor_fidelidad_id');
      if (saved) {
        setIdentificadorInput(saved);
        setActiveIdentificador(saved);
      }
    }
  }, [activeIdentificador]);

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
      toast.error('Ingresa tu cédula o código oficial de cliente.');
      return;
    }
    setActiveIdentificador(identificadorInput.trim());
  };

  const handleCopyCode = () => {
    const codeToCopy = String(codigoGenerado || cliente?.IDcliente || identificadorInput);
    if (!codeToCopy) return;
    navigator.clipboard.writeText(codeToCopy);
    setCopiedCode(true);
    toast.success('¡Código copiado al portapapeles!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black pb-24">
      {/* Barra de Acceso de Administrador si el usuario tiene rol ADMIN */}
      {esAdmin && (
        <div className="bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Rol Administrador Detectado ({session?.user?.email})</span>
            </span>
            <Link
              href="/admin/dashboard"
              className="text-xs bg-amber-500 hover:bg-amber-400 text-black px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Ir al Panel de Administración</span>
            </Link>
          </div>
        </div>
      )}

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
          Cada visita y compra en el restaurante suma un sello a tu tarjeta digital. Al acumular 10 sellos recibes tu <strong className="text-amber-400 font-bold">Granizado de 12 onzas Totalmente GRATIS</strong>.
        </p>

        {/* Tarjeta de Código Oficial para usuario logeado */}
        {codigoGenerado && (
          <div className="mt-6 max-w-md mx-auto p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/40 shadow-lg shadow-amber-500/10 flex items-center justify-between gap-3 text-left">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                Tu Código Oficial de Cliente
              </span>
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-400">
                #{codigoGenerado}
              </span>
            </div>
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200 border border-zinc-700 flex items-center gap-1.5 transition-colors"
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
        )}

        {/* Formulario de Consulta / Búsqueda */}
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-xl mx-auto">
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
                        Califícanos con 5 estrellas en Google Maps y gana +1 Sello Extra directo en tu tarjeta.
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
                    <span><strong className="text-zinc-200">Sello 10:</strong> Granizado de 12 onzas Totalmente GRATIS.</span>
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
              No encontramos registros con el identificador &quot;{activeIdentificador}&quot;. Inicia sesión o solicita al cajero que registre tu compra con este código.
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
                <h3 className="text-base font-bold text-white">3. Sello 10: Granizado 12oz GRATIS</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Completa tu tarjeta de 10 sellos y disfruta tu Granizado de 12 onzas Totalmente GRATIS. ¡Luego reinicias para volver a ganar!
                </p>
              </div>
            </div>

            {/* Banner de llamada a Misiones */}
            <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-zinc-900 to-zinc-950 border border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-5">
              <div className="space-y-1.5 text-center sm:text-left">
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
                  Misiones y Sellos Adicionales
                </span>
                <h4 className="text-lg sm:text-xl font-bold text-white">
                  ¿Quieres ganar sellos extra hoy mismo?
                </h4>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-lg">
                  Califícanos con 5 estrellas en Google Maps o síguenos en redes para sumar sellos adicionales a tu tarjeta de fidelidad.
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

      {/* ========================================================= */}
      {/* MODAL CELEBRATORIO DE BIENVENIDA */}
      {/* ========================================================= */}
      {showBienvenida && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-zinc-950 border-2 border-amber-500/50 text-center shadow-2xl shadow-amber-500/20 overflow-hidden space-y-5">
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

            <button
              onClick={() => setShowBienvenida(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/10">
              <Sparkles className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>

            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 block mb-1">
                ¡Bienvenido a Q&apos;hubo Mor!
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                {session?.user?.name ? `¡Hola, ${session.user.name}!` : '¡Ya eres Miembro VIP!'}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
                Tu cuenta ha sido creada y sincronizada con el sistema del restaurante.
              </p>
            </div>

            {/* Código generado destacado */}
            <div className="p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/40 space-y-2">
              <span className="text-[11px] uppercase tracking-wider font-bold text-zinc-400 block">
                Tu Código Oficial de Cliente
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-black font-mono text-amber-400 tracking-wider">
                  #{codigoGenerado || cliente?.IDcliente || '------'}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700 transition-colors"
                  title="Copiar código"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[11px] text-zinc-400">
                Solo debes dictar este código en caja al momento de comprar para acumular sellos.
              </p>
            </div>

            {/* Acciones */}
            <div className="space-y-2.5 pt-2">
              <Link
                href="/misiones"
                onClick={() => setShowBienvenida(false)}
                className="w-full py-3.5 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
              >
                <span>Ganar mis primeros sellos en Misiones 🚀</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => setShowBienvenida(false)}
                className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition-colors"
              >
                Ver Mi Tarjeta Digital
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FidelidadPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-zinc-400">Cargando tarjeta de fidelidad...</div>}>
      <FidelidadContent />
    </Suspense>
  );
}
