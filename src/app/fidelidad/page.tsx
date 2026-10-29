'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { DigitalLoyaltyCard } from '@/components/fidelidad/DigitalLoyaltyCard';
import { PurchaseHistory } from '@/components/fidelidad/PurchaseHistory';
import { useFidelidadSocket } from '@/hooks/useFidelidadSocket';
import { FidelidadClienteResponse } from '@/lib/erp-client';
import { Google } from '@/components/ui/icons';
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
  LogIn,
  UserPlus,
  QrCode,
  Flame,
  ChevronDown,
  Lock,
} from 'lucide-react';
import { toast } from 'sonner';

function FidelidadContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session?.user;
  const esAdmin = (session as any)?.role === 'ADMIN';

  const [identificadorInput, setIdentificadorInput] = useState('');
  const [activeIdentificador, setActiveIdentificador] = useState<string | null>(null);
  const [cliente, setCliente] = useState<FidelidadClienteResponse | null>(null);
  const [loading, setLoading] = useState(false);

  // Modal de bienvenida al iniciar sesión o registrarse
  const [showBienvenida, setShowBienvenida] = useState(false);
  const [codigoGenerado, setCodigoGenerado] = useState<number | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Estado para alternar el buscador manual si no está logeado
  const [showManualSearch, setShowManualSearch] = useState(false);

  // 1. Sincronizar automáticamente el usuario con el ERP al tener sesión iniciada
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

        // Si no vino en la sesión aún, sincronizarlo vía API para obtener/generar código de 6 dígitos
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

  // 3. Si no hay sesión, revisar si hay identificador guardado previamente
  useEffect(() => {
    if (typeof window !== 'undefined' && !activeIdentificador && status === 'unauthenticated') {
      const saved = localStorage.getItem('qhubomor_fidelidad_id');
      if (saved) {
        setIdentificadorInput(saved);
        setActiveIdentificador(saved);
      }
    }
  }, [activeIdentificador, status]);

  const fetchCliente = useCallback(async (id: string, isSilent = false) => {
    if (!id.trim()) return;
    if (!isSilent) setLoading(true);

    try {
      const res = await fetch(
        `/api/fidelidad/consultar?identificador=${encodeURIComponent(id.trim())}&_t=${Date.now()}`,
        {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          },
        }
      );
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
        toast.success(`Tarjeta cargada: ${data.nombre}`);
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

  // Refrescar automáticamente al regresar a la pestaña o al navegar
  useEffect(() => {
    const handleRefresh = () => {
      if (activeIdentificador) {
        fetchCliente(activeIdentificador, true);
      }
    };
    window.addEventListener('focus', handleRefresh);
    window.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') handleRefresh();
    });
    window.addEventListener('fidelidad:actualizada', handleRefresh);
    return () => {
      window.removeEventListener('focus', handleRefresh);
      window.removeEventListener('fidelidad:actualizada', handleRefresh);
    };
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

      {/* ========================================================================= */}
      {/* CASO 1: USUARIO CON SESIÓN INICIADA -> MOSTRAR PUNTOS Y TARJETA DIRECTAMENTE */}
      {/* ========================================================================= */}
      {isLoggedIn ? (
        <>
          {/* Header de bienvenida con puntos del cliente */}
          <section className="relative px-4 pt-8 sm:pt-12 pb-6 max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/30 border border-amber-500/30 shadow-2xl shadow-amber-500/10">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Miembro Oficial del Club Privilege</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  ¡Hola, <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400">{session.user?.name || 'Cliente VIP'}</span>!
                </h1>
                <p className="text-xs sm:text-sm text-zinc-400 max-w-xl leading-relaxed">
                  Aquí tienes tu balance de puntos y sellos en vivo. Dicta tu código en caja o menciónalo en tus pedidos a domicilio para acumular sellos y canjear tus premios.
                </p>
              </div>

              {/* Bloque resumen de puntos y código */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
                {/* Caja de Sellos Acumulados */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900/90 border border-amber-500/40 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                    Sellos Acumulados
                  </span>
                  <div className="flex items-center justify-center gap-1.5 mt-1">
                    <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">
                      {cliente?.contador || 0}
                    </span>
                    <span className="text-xs font-bold text-zinc-400">/ 10</span>
                  </div>
                  <span className="text-[10px] text-amber-400/90 font-semibold block mt-0.5">
                    {cliente?.granizadoGratis
                      ? '¡Granizado Gratis Disponible!'
                      : `${Math.max(0, 10 - (cliente?.contador || 0))} para Granizado Gratis`}
                  </span>
                </div>

                {/* Caja de Código Oficial o Cédula */}
                <div className="p-3.5 sm:p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                    {cliente?.cedula ? 'Tu Cédula / POS' : 'Tu Código POS'}
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-white font-mono block mt-1">
                    {cliente?.cedula || `#${codigoGenerado || cliente?.IDcliente || '---'}`}
                  </span>
                  <button
                    onClick={handleCopyCode}
                    className="mt-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center justify-center gap-1 mx-auto"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCode ? '¡Copiado!' : (cliente?.cedula ? 'Copiar cédula' : 'Copiar código')}</span>
                  </button>
                </div>

                {/* Caja de Compras Totales */}
                <div className="col-span-2 sm:col-span-1 p-3.5 sm:p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-center flex flex-col justify-center">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                    Compras en POS
                  </span>
                  <span className="text-xl sm:text-2xl font-black text-zinc-200 font-mono block mt-1">
                    {cliente?.comprasTotales || cliente?.contador || 0}
                  </span>
                  <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">
                    Caja y Domicilios
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Contenido principal: Tarjeta Digital e Historial */}
          <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-2">
            {loading && !cliente ? (
              <div className="py-20 text-center space-y-4">
                <RefreshCw className="w-10 h-10 text-amber-400 animate-spin mx-auto" />
                <p className="text-sm text-zinc-400 font-medium">
                  Cargando tus puntos y tarjeta de fidelidad en tiempo real...
                </p>
              </div>
            ) : cliente ? (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Columna Izquierda: Tarjeta Digital VIP y Acceso a Misiones */}
                <div className="lg:col-span-5 space-y-6">
                  <DigitalLoyaltyCard
                    cliente={cliente}
                    isRealtimeConnected={isConnected}
                    onCedulaActualizada={() => activeIdentificador && fetchCliente(activeIdentificador)}
                  />

                  {/* Acceso directo a Misiones para sumar sellos extra */}
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
                            <span>Misiones Disponibles</span>
                            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          </h4>
                          <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                            Reseña en Google Maps y redes sociales = <strong className="text-amber-400">+2 Sellos Extra</strong>.
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
                      <span>Beneficios de tu Membresía</span>
                    </h4>
                    <ul className="text-xs text-zinc-400 space-y-2.5">
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span><strong className="text-zinc-200">Sello 5:</strong> 15% de descuento en tu consumo.</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span><strong className="text-zinc-200">Sello 10:</strong> Granizado de 12 onzas GRATIS (válido en caja o a domicilio).</span>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <span><strong className="text-zinc-200">Sincronización en vivo:</strong> El cajero ve tus sellos al buscar tu código.</span>
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
            ) : (
              <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-4 max-w-md mx-auto">
                <Sparkles className="w-10 h-10 text-amber-400 mx-auto animate-pulse" />
                <h3 className="text-lg font-bold text-white">Generando tu Tarjeta de Fidelidad</h3>
                <p className="text-xs text-zinc-400">
                  Estamos sincronizando tu cuenta con el sistema de facturación. Si tarda unos segundos, actualiza la página.
                </p>
                <button
                  onClick={() => activeIdentificador && fetchCliente(activeIdentificador)}
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
                >
                  Recargar Tarjeta
                </button>
              </div>
            )}

            {/* Opción secundaria para consultar otra cédula/código */}
            <div className="mt-12 text-center pt-6 border-t border-zinc-900">
              <button
                onClick={() => setShowManualSearch(!showManualSearch)}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-1.5"
              >
                <span>¿Deseas consultar la tarjeta de otro familiar o cliente?</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showManualSearch ? 'rotate-180' : ''}`} />
              </button>

              {showManualSearch && (
                <form onSubmit={handleSubmit} className="mt-4 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto">
                  <input
                    type="text"
                    value={identificadorInput}
                    onChange={(e) => setIdentificadorInput(e.target.value)}
                    placeholder="Ingresa cédula o código"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-zinc-200"
                  >
                    Buscar
                  </button>
                </form>
              )}
            </div>
          </main>
        </>
      ) : (
        /* ========================================================================= */
        /* CASO 2: USUARIO SIN SESIÓN -> ELEMENTO ALTAMENTE LLAMATIVO PARA REGISTRO/LOGIN */
        /* ========================================================================= */
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-16 space-y-10">
          {/* Tarjeta Héroe VIP Ultra Llamativa */}
          <section className="relative rounded-3xl p-6 sm:p-10 md:p-12 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border-2 border-amber-500/50 shadow-2xl shadow-amber-500/20 text-center overflow-hidden space-y-6">
            {/* Efectos de luz de fondo */}
            <div className="absolute -top-32 -right-32 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -left-32 w-72 h-72 bg-orange-500/20 rounded-full blur-3xl pointer-events-none" />

            {/* Badge de encabezado */}
            <div className="relative inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-amber-500/15 text-amber-300 border border-amber-500/40 shadow-lg shadow-amber-500/10">
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>Club de Fidelidad Oficial Q&apos;hubo Mor</span>
            </div>

            {/* Título de impacto */}
            <div className="relative space-y-3 max-w-2xl mx-auto">
              <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
                ¡Empieza a Acumular tus <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-500">Puntos y Sellos</span>!
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-zinc-300 leading-relaxed">
                Inicia sesión o regístrate en <strong className="text-white">1 solo clic</strong> para obtener tu código exclusivo de cliente, ver tus sellos y canjear premios en el restaurante.
              </p>
            </div>

            {/* BOTÓN GOOGLE EXTRA LLAMATIVO */}
            <div className="relative pt-2 max-w-md mx-auto space-y-3">
              <button
                onClick={() => signIn('google', { callbackUrl: '/fidelidad?bienvenida=true' })}
                className="w-full py-4 sm:py-5 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-black text-base sm:text-lg transition-all flex items-center justify-center gap-3.5 shadow-2xl shadow-white/30 hover:shadow-white/40 hover:scale-[1.02] active:scale-95 border-2 border-white group cursor-pointer"
              >
                <Google className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Continuar con Google</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-xs text-amber-400/90 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Te generamos un código de cliente único de máx 6 dígitos sin pedir cédula</span>
              </div>
            </div>

            {/* Botones secundarios (login o registro con correo) */}
            <div className="relative flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
              <Link
                href="/login?callbackUrl=/fidelidad?bienvenida=true"
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs sm:text-sm font-bold border border-zinc-800 hover:border-amber-500/40 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-amber-400" />
                <span>Ya tengo cuenta</span>
              </Link>
              <Link
                href="/register?callbackUrl=/fidelidad?bienvenida=true"
                className="w-full sm:w-1/2 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs sm:text-sm font-bold border border-zinc-800 hover:border-amber-500/40 transition-colors flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Crear con correo</span>
              </Link>
            </div>
          </section>

          {/* Grilla de Recompensas e Información de Beneficios */}
          <section className="space-y-4">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                ¿Qué ganas siendo parte del Club?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400">
                Cada pedido facturado en caja o solicitado por domicilio suma compras automáticamente a tu tarjeta virtual.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Tarjeta Beneficio 1 */}
              <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/30 transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <h3 className="text-base font-bold text-white">Sello 5: 15% Descuento</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  A mitad de camino en tu ciclo de lealtad recibes un 15% de descuento inmediato aplicable a tu consumo.
                </p>
              </div>

              {/* Tarjeta Beneficio 2 (Granizado GRATIS) */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-amber-500/15 via-zinc-900 to-orange-500/10 border-2 border-amber-500/40 hover:border-amber-500/60 transition-all space-y-3 shadow-lg shadow-amber-500/5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <Gift className="w-6 h-6" />
                </div>
                <h3 className="text-base font-black text-amber-300">Sello 10: Granizado 12oz GRATIS</h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Completa tu ciclo de 10 sellos y reclama tu <strong className="text-amber-400">Granizado de 12 onzas GRATIS</strong> tanto en caja física como a través de nuestros domicilios.
                </p>
              </div>

              {/* Tarjeta Beneficio 3 (Misiones) */}
              <div className="p-6 rounded-3xl bg-zinc-900/70 border border-zinc-800 hover:border-amber-500/30 transition-all space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Misiones: +2 Sellos Extra</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                  Califica en Google Maps y síguenos en redes para sumar 2 sellos extra a tu saldo desde hoy mismo.
                </p>
              </div>
            </div>
          </section>

          {/* Buscador secundario para clientes que ya tengan un código pero no hayan iniciado sesión */}
          <section className="p-6 rounded-3xl bg-zinc-950/70 border border-zinc-900 text-center max-w-xl mx-auto space-y-4">
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-zinc-300 flex items-center justify-center gap-1.5">
                <Search className="w-4 h-4 text-amber-400" />
                <span>¿Ya tienes un código y solo quieres consultar?</span>
              </h4>
              <p className="text-xs text-zinc-500">
                Ingresa tu número de cédula o código para consultar tu progreso sin iniciar sesión:
              </p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
              <input
                type="text"
                value={identificadorInput}
                onChange={(e) => setIdentificadorInput(e.target.value)}
                placeholder="Ej: 50934 o Cédula"
                className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-extrabold text-xs transition-colors shrink-0"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : 'Consultar'}
              </button>
            </form>

            {cliente && (
              <div className="pt-4 text-left">
                <DigitalLoyaltyCard cliente={cliente} isRealtimeConnected={isConnected} />
              </div>
            )}
          </section>
        </main>
      )}

      {/* ========================================================= */}
      {/* MODAL CELEBRATORIO DE BIENVENIDA TRAS REGISTRO / LOGIN */}
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
                Solo debes dictar este código en caja o mencionarlo en tus pedidos a domicilio para acumular sellos y canjear tu granizado gratis.
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
