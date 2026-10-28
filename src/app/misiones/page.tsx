'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signIn } from 'next-auth/react';
import {
  MapPin,
  Star,
  Award,
  UploadCloud,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  ArrowLeft,
  Camera,
  RefreshCw,
  Gift,
  UserCheck,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Lock,
  X,
  LogIn,
} from 'lucide-react';
import { Google } from '@/components/ui/icons';
import { toast } from 'sonner';

export default function MisionesPage() {
  const { data: session, status } = useSession();
  const isLoggedIn = status === 'authenticated' && !!session?.user;

  // Estado del modal de autenticación
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Estado para datos de identificación del cliente
  const [codigoCliente, setCodigoCliente] = useState<number | null>(null);
  const [cedula, setCedula] = useState('');
  const [nombre, setNombre] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  // Estados de carga de archivos (URLs locales o base64 para preview)
  const [googleScreenshot, setGoogleScreenshot] = useState<string | null>(null);
  const [igScreenshot, setIgScreenshot] = useState<string | null>(null);
  const [tiktokScreenshot, setTiktokScreenshot] = useState<string | null>(null);
  const [fbScreenshot, setFbScreenshot] = useState<string | null>(null);

  // Estados de completado / sellos acreditados
  const [googleClaimed, setGoogleClaimed] = useState(false);
  const [socialClaimed, setSocialClaimed] = useState(false);

  // Enlaces de redes sociales sincronizados con admin/settings
  const [socialLinks, setSocialLinks] = useState({
    instagramUrl: 'https://www.instagram.com/q.hubo_mor?igsh=MWUyMHZjM2V0MHd5eA==',
    tiktokUrl: 'https://www.tiktok.com/@q.hubo_mor?_r=1&_t=ZS-91oYc9Wq6gD',
    facebookUrl: 'https://www.facebook.com/share/17TBCC1uvw/',
  });

  // Cargar enlaces configurados desde la base de datos (admin/settings)
  useEffect(() => {
    fetch('/api/admin/site-config')
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          setSocialLinks((prev) => ({
            instagramUrl: data.instagramUrl || prev.instagramUrl,
            tiktokUrl: data.tiktokUrl || prev.tiktokUrl,
            facebookUrl: data.facebookUrl || prev.facebookUrl,
          }));
        }
      })
      .catch((err) => console.error('Error al cargar enlaces de redes:', err));
  }, []);

  // Estados de carga durante envío al backend
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingSocial, setLoadingSocial] = useState(false);

  // Si no está logeado al entrar, abrir modal de inicio de sesión tras 600ms
  useEffect(() => {
    if (status === 'unauthenticated') {
      const timer = setTimeout(() => setShowAuthModal(true), 600);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // Consultar en la base de datos real del ERP el estado de las misiones para este cliente
  const consultarEstadoMisionesBD = async (identificador: string | number) => {
    const clean = String(identificador).trim().replace(/^#/, '');
    if (!clean) return;

    try {
      const res = await fetch(`/api/fidelidad/consultar?identificador=${encodeURIComponent(clean)}&_t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;

      const data = await res.json();
      const fidelidad = data?.data ?? data;
      if (fidelidad) {
        if (fidelidad.misionGoogleCompletada) {
          setGoogleClaimed(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('qhubomor_mision_google_done', 'true');
          }
        }
        if (fidelidad.misionRedesCompletada) {
          setSocialClaimed(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('qhubomor_mision_social_done', 'true');
          }
        }
      }
    } catch (e) {
      console.error('Error consultando estado de misiones en ERP:', e);
    }
  };

  // Si está logeado, sincronizar con el ERP para obtener el código único de cliente de máx 6 dígitos
  useEffect(() => {
    async function syncUsuario() {
      if (status === 'authenticated' && session?.user?.email) {
        if (session.user.name && !nombre) {
          setNombre(session.user.name);
        }

        const enSesion = (session as any).codigoCliente;
        if (enSesion) {
          setCodigoCliente(Number(enSesion));
          setCedula(String(enSesion));
          if (typeof window !== 'undefined') {
            localStorage.setItem('qhubomor_fidelidad_id', String(enSesion));
          }
          consultarEstadoMisionesBD(enSesion);
          return;
        }

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
            setCodigoCliente(data.cliente.IDcliente);
            setCedula(String(data.cliente.IDcliente));
            if (typeof window !== 'undefined') {
              localStorage.setItem('qhubomor_fidelidad_id', String(data.cliente.IDcliente));
            }
            if (data.cliente.misionGoogleCompletada) {
              setGoogleClaimed(true);
              if (typeof window !== 'undefined') localStorage.setItem('qhubomor_mision_google_done', 'true');
            }
            if (data.cliente.misionRedesCompletada) {
              setSocialClaimed(true);
              if (typeof window !== 'undefined') localStorage.setItem('qhubomor_mision_social_done', 'true');
            }
            consultarEstadoMisionesBD(data.cliente.IDcliente);
          }
        } catch (e) {
          console.error('Error sincronizando cliente en misiones:', e);
        }
      }
    }
    syncUsuario();
  }, [status, session, nombre]);

  // Consultar en BD cuando cambie la cédula o código ingresado
  useEffect(() => {
    if (cedula && cedula.trim()) {
      consultarEstadoMisionesBD(cedula.trim());
    }
  }, [cedula]);

  // Listener para refrescar estado en vivo al volver a la pestaña o al navegar
  useEffect(() => {
    const handleRefresh = () => {
      const activeId = codigoCliente || cedula || ((session as any)?.codigoCliente);
      if (activeId) {
        consultarEstadoMisionesBD(activeId);
      }
    };
    window.addEventListener('focus', handleRefresh);
    window.addEventListener('visibilitychange', handleRefresh);
    window.addEventListener('fidelidad:actualizada', handleRefresh);
    return () => {
      window.removeEventListener('focus', handleRefresh);
      window.removeEventListener('visibilitychange', handleRefresh);
      window.removeEventListener('fidelidad:actualizada', handleRefresh);
    };
  }, [codigoCliente, cedula, session]);

  // Cargar cédula guardada previamente en el dispositivo
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedId = localStorage.getItem('qhubomor_fidelidad_id');
      if (savedId) {
        setCedula(savedId);
      }
      const savedGoogle = localStorage.getItem('qhubomor_mision_google_done');
      if (savedGoogle === 'true') {
        setGoogleClaimed(true);
      }
      const savedSocial = localStorage.getItem('qhubomor_mision_social_done');
      if (savedSocial === 'true') {
        setSocialClaimed(true);
      }
    }
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (val: string) => void
  ) => {
    if (!isLoggedIn) {
      e.target.value = '';
      setShowAuthModal(true);
      toast.error('Debes iniciar sesión con Google para registrar tus comprobantes.');
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setter(String(reader.result));
      toast.success('Captura cargada con éxito.');
    };
    reader.readAsDataURL(file);
  };

  // Reclamar Sello de Misión 1 (Google Maps)
  const handleClaimGoogle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setShowAuthModal(true);
      toast.error('Inicia sesión con Google para reclamar y acreditar tu sello.');
      return;
    }

    if (!googleScreenshot) {
      toast.error('Primero debes adjuntar la captura de tu reseña 5 estrellas en Google Maps.');
      return;
    }

    const docOrCode = cedula.trim() || (codigoCliente ? String(codigoCliente) : '');
    if (!docOrCode) {
      toast.error('No se pudo identificar tu código de cliente. Por favor inicia sesión nuevamente.');
      return;
    }

    setLoadingGoogle(true);
    try {
      const res = await fetch('/api/fidelidad/reclamar-mision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: docOrCode,
          nombre: nombre.trim() || session?.user?.name || undefined,
          whatsapp: whatsapp.trim() || undefined,
          tipoMision: 'GOOGLE_REVIEW',
          capturas: [
            {
              plataforma: 'GOOGLE_MAPS',
              base64: googleScreenshot,
            },
          ],
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo acreditar el sello');
      }

      setGoogleClaimed(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('qhubomor_fidelidad_id', docOrCode);
        localStorage.setItem('qhubomor_mision_google_done', 'true');
        window.dispatchEvent(new CustomEvent('fidelidad:actualizada'));
      }

      toast.success(
        data.mensaje || '¡Sello acreditado con éxito! Se sumó +1 compra a tu tarjeta de fidelidad.'
      );
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar la acreditación del sello.');
    } finally {
      setLoadingGoogle(false);
    }
  };

  // Reclamar Sello de Misión 2 (Redes Sociales)
  const handleClaimSocial = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn) {
      setShowAuthModal(true);
      toast.error('Inicia sesión con Google para reclamar y acreditar tu sello.');
      return;
    }

    if (!igScreenshot && !tiktokScreenshot && !fbScreenshot) {
      toast.error('Adjunta al menos una captura de haber seguido nuestros perfiles de redes.');
      return;
    }

    const docOrCode = cedula.trim() || (codigoCliente ? String(codigoCliente) : '');
    if (!docOrCode) {
      toast.error('No se pudo identificar tu código de cliente. Por favor inicia sesión nuevamente.');
      return;
    }

    const capturas: Array<{ plataforma: string; base64: string }> = [];
    if (igScreenshot) capturas.push({ plataforma: 'INSTAGRAM', base64: igScreenshot });
    if (tiktokScreenshot) capturas.push({ plataforma: 'TIKTOK', base64: tiktokScreenshot });
    if (fbScreenshot) capturas.push({ plataforma: 'FACEBOOK', base64: fbScreenshot });

    setLoadingSocial(true);
    try {
      const res = await fetch('/api/fidelidad/reclamar-mision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cedula: docOrCode,
          nombre: nombre.trim() || session?.user?.name || undefined,
          whatsapp: whatsapp.trim() || undefined,
          tipoMision: 'REDES_SOCIALES',
          capturas,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'No se pudo acreditar el sello');
      }

      setSocialClaimed(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('qhubomor_fidelidad_id', docOrCode);
        localStorage.setItem('qhubomor_mision_social_done', 'true');
        window.dispatchEvent(new CustomEvent('fidelidad:actualizada'));
      }

      toast.success(
        data.mensaje || '¡Sello de redes acreditado con éxito! Se sumó +1 compra a tu tarjeta.'
      );
    } catch (err: any) {
      toast.error(err.message || 'Error al procesar la acreditación del sello.');
    } finally {
      setLoadingSocial(false);
    }
  };

  const googleMapsUrl =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_URL ||
    "https://www.google.com/maps/search/?api=1&query=Q'hubo+Mor";

  return (
    <div className="min-h-screen bg-black text-white selection:bg-amber-500 selection:text-black pb-28">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 pt-8 pb-6 max-w-6xl mx-auto flex items-center justify-between border-b border-zinc-900">
        <Link
          href="/fidelidad"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-amber-400" />
          <span>Volver a Mi Tarjeta</span>
        </Link>
        <span className="text-xs font-mono font-bold text-amber-400 tracking-wider uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          Misiones Oficiales
        </span>
      </header>

      <main className="px-4 sm:px-6 lg:px-8 pt-8 max-w-6xl mx-auto space-y-8">
        {/* Banner de Estado de Autenticación si no está logeado */}
        {!isLoggedIn && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-zinc-900 to-zinc-950 border border-amber-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
            <div className="flex items-center gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 shrink-0">
                <Lock className="w-5 h-5 text-amber-400" />
              </div>
              <div className="text-left">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Debes iniciar sesión para acreditar tus sellos</span>
                  <span className="text-[10px] uppercase font-bold text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-full">Requerido</span>
                </h4>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Regístrate o inicia sesión con Google en 1 clic para que las misiones sumen compras a tu tarjeta digital.
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-md shadow-white/20 shrink-0 transition-transform active:scale-95"
            >
              <Google className="w-4 h-4 shrink-0" />
              <span>Iniciar con Google</span>
            </button>
          </div>
        )}

        {/* Banner informativo de los 2 tipos de sellos */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>2 Misiones Disponibles = 2 Sellos Extra</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Gana Sellos Extra para tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-500">Tarjeta de Fidelidad</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
            Realiza las siguientes labores, ingresa tu cédula o código de cliente y el sistema sumará automáticamente una compra por sello a tu tarjeta digital. Al llegar a los 10 sellos reclamas tu <strong className="text-amber-400 font-bold">Granizado de 12 onzas GRATIS (válido en caja o a domicilio)</strong>.
          </p>
        </div>

        {/* Formulario Global de Identificación / Registro */}
        <div className="p-6 sm:p-7 rounded-3xl bg-zinc-950/80 border border-amber-500/30 shadow-xl shadow-amber-500/5 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Identificación Oficial en Q&apos;hubo Mor
                </h3>
                <p className="text-xs text-zinc-400">
                  {isLoggedIn
                    ? `Sesión activa como ${session?.user?.name || session?.user?.email}. Tu código único está ligado al sistema POS.`
                    : 'Inicia sesión con Google para recibir tu código único de máx 6 dígitos y ligar tus sellos.'}
                </p>
              </div>
            </div>

            {!isLoggedIn && (
              <button
                onClick={() => setShowAuthModal(true)}
                className="text-xs text-amber-400 hover:text-amber-300 font-bold underline flex items-center gap-1"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>¿No has iniciado sesión? Entra con Google</span>
              </button>
            )}
          </div>

          {isLoggedIn ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-amber-500/30">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                  Tu Código de Cliente Oficial (POS)
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-amber-400 block mt-0.5">
                  #{codigoCliente || cedula || 'Sincronizando...'}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Sincronizado con el restaurante</span>
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block">
                  Cliente Registrado
                </span>
                <span className="text-sm font-bold text-white truncate block mt-1">
                  {nombre || session?.user?.name || 'Cliente VIP'}
                </span>
                <span className="text-[10px] text-zinc-500 block truncate">
                  {session?.user?.email}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  WhatsApp (para notificaciones)
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej: 3135303978"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Cédula o Código de Cliente <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                  placeholder="Ej: 50934 o Cédula"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  Nombre Completo (si eres nuevo)
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Ej: Juan Pérez"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                  WhatsApp (opcional)
                </label>
                <input
                  type="text"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ej: 3135303978"
                  className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500 font-mono transition-colors"
                />
              </div>
            </div>
          )}
        </div>

        {/* Grid de 2 Columnas para las 2 Misiones */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* ========================================================= */}
          {/* MISIÓN 1: GOOGLE MAPS (1 SELLO) */}
          {/* ========================================================= */}
          <section className="lg:col-span-6 relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/20 border border-amber-500/30 shadow-xl shadow-amber-500/5 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <MapPin className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    Misión Tipo 1
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Reseña 5 Estrellas en Google Maps
                  </h2>
                </div>
              </div>

              {googleClaimed ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sello Acreditado</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <span>+1 Sello Extra</span>
                </span>
              )}
            </div>

            {/* Tarjeta de Recompensa Específica */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="text-xs">
                <strong className="text-amber-300 block font-bold text-sm">
                  Premio: +1 Sello Extra directo a tu Tarjeta
                </strong>
                <span className="text-zinc-400 text-xs">
                  Acredita 1 compra a tu saldo de lealtad para avanzar hacia tu Granizado de 12oz GRATIS (en caja o a domicilio).
                </span>
              </div>
            </div>

            {/* Estrellas decorativas */}
            <div className="flex items-center gap-1 text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
              <span className="text-xs text-zinc-400 ml-2 font-medium">Calificación 5/5 con tu opinión</span>
            </div>

            {googleClaimed ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-extrabold text-white">¡Misión de Google Maps Completada!</h4>
                <p className="text-xs text-zinc-300">
                  Ya has acreditado tu sello por tu reseña 5 estrellas en Google Maps. ¡Gracias por tu calificación!
                </p>
              </div>
            ) : (
              <>
                {/* Botón para abrir Google Maps */}
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 shadow-md shadow-amber-500/20 active:scale-98"
                >
                  <span>1. Abrir Google Maps para calificar</span>
                  <ExternalLink className="w-4 h-4" />
                </a>

                {/* Zona de subida de captura */}
                <div className="pt-2 border-t border-zinc-800/80 space-y-2">
                  <label className="block text-xs font-bold text-zinc-300">
                    2. Sube la captura de tu reseña publicada
                  </label>

                  <div
                    onClick={() => {
                      if (!isLoggedIn) {
                        setShowAuthModal(true);
                        toast.error('Inicia sesión con Google para subir tu captura.');
                      }
                    }}
                    className="relative border-2 border-dashed border-zinc-700 hover:border-amber-500/60 rounded-2xl p-5 text-center transition-colors bg-zinc-950/70 cursor-pointer group"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, setGoogleScreenshot)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />

                    {googleScreenshot ? (
                      <div className="flex flex-col items-center gap-1.5 text-emerald-400 font-bold text-xs">
                        <CheckCircle2 className="w-6 h-6" />
                        <span>Captura lista. Haz clic si deseas cambiarla.</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-zinc-400 group-hover:text-zinc-200 transition-colors">
                        <Camera className="w-6 h-6 text-amber-400/80 mb-1" />
                        <span className="text-xs font-semibold">Seleccionar o tomar captura de la reseña</span>
                        <span className="text-[10px] text-zinc-500">JPG, PNG o WebP</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-300">Auditoría con IA:</strong> Se verificará automáticamente con Gemini Vision que tu reseña contenga 5 estrellas y sea reciente.
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Botón de Acreditación */}
            <button
              onClick={handleClaimGoogle}
              disabled={loadingGoogle || googleClaimed}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-black font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-98"
            >
              {loadingGoogle ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditando captura con Inteligencia Artificial...</span>
                </>
              ) : googleClaimed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Sello de Google Maps Reclamado!</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>3. Reclamar +1 Sello de Google Maps</span>
                </>
              )}
            </button>
          </section>

          {/* ========================================================= */}
          {/* MISIÓN 2: SEGUIR EN TODAS LAS REDES (1 SELLO) */}
          {/* ========================================================= */}
          <section className="lg:col-span-6 relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-zinc-900 via-zinc-950 to-amber-950/20 border border-amber-500/30 shadow-xl shadow-amber-500/5 space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">
                  <ShieldCheck className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold block">
                    Misión Tipo 2
                  </span>
                  <h2 className="text-lg sm:text-xl font-black text-white">
                    Síguenos en Todas Nuestras Redes
                  </h2>
                </div>
              </div>

              {socialClaimed ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sello Acreditado</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                  <span>+1 Sello Extra</span>
                </span>
              )}
            </div>

            {/* Tarjeta de Recompensa Específica */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3">
              <Award className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="text-xs">
                <strong className="text-amber-300 block font-bold text-sm">
                  Premio: +1 Sello Extra directo a tu Tarjeta
                </strong>
                <span className="text-zinc-400 text-xs">
                  Síguenos en nuestros perfiles oficiales y acredita 1 compra extra en tu sistema de puntos.
                </span>
              </div>
            </div>

            {socialClaimed ? (
              <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-base font-extrabold text-white">¡Misión de Redes Sociales Completada!</h4>
                <p className="text-xs text-zinc-300">
                  Ya has acreditado tu sello por seguir nuestras cuentas oficiales. ¡Gracias por apoyarnos!
                </p>
              </div>
            ) : (
              <>
                {/* Perfiles de Redes Sociales */}
                <div className="space-y-3 pt-1">
                  {/* Instagram */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">Instagram</h4>
                      <p className="text-[11px] text-zinc-400 font-mono">@q.hubo_mor</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={socialLinks.instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Seguir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <label className="relative py-1.5 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border border-amber-500/30">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setIgScreenshot)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Camera className="w-3 h-3" />
                        <span>{igScreenshot ? '✓ Lista' : 'Captura'}</span>
                      </label>
                    </div>
                  </div>

                  {/* TikTok */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">TikTok</h4>
                      <p className="text-[11px] text-zinc-400 font-mono">@q.hubo_mor</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={socialLinks.tiktokUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Seguir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <label className="relative py-1.5 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border border-amber-500/30">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setTiktokScreenshot)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Camera className="w-3 h-3" />
                        <span>{tiktokScreenshot ? '✓ Lista' : 'Captura'}</span>
                      </label>
                    </div>
                  </div>

                  {/* Facebook */}
                  <div className="p-3.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 flex items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-white">Facebook</h4>
                      <p className="text-[11px] text-zinc-400">Q&apos;hubo Mor Oficial</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <a
                        href={socialLinks.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="py-1.5 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Seguir</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <label className="relative py-1.5 px-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors border border-amber-500/30">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setFbScreenshot)}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Camera className="w-3 h-3" />
                        <span>{fbScreenshot ? '✓ Lista' : 'Captura'}</span>
                      </label>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] text-zinc-400 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-zinc-300">Auditoría con IA:</strong> Se verificará con Gemini Vision que sigas a <strong className="text-amber-400">@q.hubo_mor</strong> (botón &ldquo;Siguiendo&rdquo; o &ldquo;Following&rdquo;) y que la captura sea reciente.
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Botón de Acreditación */}
            <button
              onClick={handleClaimSocial}
              disabled={loadingSocial || socialClaimed}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 disabled:opacity-50 text-black font-black text-sm transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 active:scale-98"
            >
              {loadingSocial ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Auditando capturas con Inteligencia Artificial...</span>
                </>
              ) : socialClaimed ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Sello de Redes Reclamado!</span>
                </>
              ) : (
                <>
                  <Award className="w-4 h-4" />
                  <span>Reclamar +1 Sello por Redes Sociales</span>
                </>
              )}
            </button>
          </section>
        </div>

        {/* Banner inferior con acceso a la Tarjeta Digital */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-zinc-900 via-black to-zinc-900 border border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="space-y-1.5 text-center sm:text-left">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              Club de Fidelidad Privilege
            </span>
            <h4 className="text-lg sm:text-xl font-bold text-white">
              ¿Listo para consultar tu progreso?
            </h4>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-lg leading-relaxed">
              Recuerda: <strong>Sello 5 = 15% Descuento</strong> y <strong>Sello 10 = Granizado de 12 onzas GRATIS (en caja o a domicilio)</strong>.
            </p>
          </div>

          <Link
            href="/fidelidad"
            className="px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs sm:text-sm transition-all shadow-lg shadow-amber-500/20 shrink-0 flex items-center gap-2"
          >
            <span>Ver Mi Tarjeta de Fidelidad</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      {/* ========================================================= */}
      {/* MODAL POPUP LLAMATIVO DE GOOGLE SIGN-IN / REGISTRO */}
      {/* ========================================================= */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl p-6 sm:p-8 bg-zinc-950 border border-amber-500/40 text-center shadow-2xl shadow-amber-500/10 overflow-hidden space-y-5">
            {/* Resplandor ámbar decorativo */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-orange-500/15 rounded-full blur-3xl pointer-events-none" />

            {/* Botón cerrar */}
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Icono central */}
            <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-inner">
              <Gift className="w-7 h-7 text-amber-400 animate-pulse" />
            </div>

            <div>
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 block mb-1">
                Club de Fidelidad Q&apos;hubo Mor
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Inicia Sesión para Acreditar tus Sellos
              </h3>
              <p className="text-xs sm:text-sm text-zinc-400 mt-2 leading-relaxed">
                Para validar tus labores y registrar tus compras hacia tu <strong className="text-amber-400 font-bold">Granizado de 12 onzas GRATIS (en caja o a domicilio)</strong>, debes acceder a tu cuenta.
              </p>
            </div>

            {/* BOTÓN GOOGLE EXTRA LLAMATIVO */}
            <div className="pt-1">
              <button
                onClick={() => signIn('google', { callbackUrl: '/misiones' })}
                className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-black text-base sm:text-lg transition-all flex items-center justify-center gap-3 shadow-2xl shadow-white/20 hover:shadow-white/30 hover:scale-[1.02] active:scale-95 border-2 border-white group"
              >
                <Google className="w-6 h-6 shrink-0 group-hover:scale-110 transition-transform" />
                <span>Continuar con Google</span>
              </button>
              <span className="inline-block text-[11px] text-amber-400/90 font-semibold mt-2">
                ⚡ Más fácil y rápido en 1 solo clic sin contraseñas
              </span>
            </div>

            {/* Divisor */}
            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-zinc-800 w-full" />
              <span className="bg-zinc-950 px-3 text-[11px] text-zinc-500 uppercase tracking-wider font-mono">
                o con tu correo
              </span>
              <div className="border-t border-zinc-800 w-full" />
            </div>

            {/* Enlaces alternativos */}
            <div className="flex gap-2.5">
              <Link
                href="/login?callbackUrl=/misiones"
                className="flex-1 py-3 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-800 transition-colors text-center"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register?callbackUrl=/misiones"
                className="flex-1 py-3 px-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-800 transition-colors text-center"
              >
                Crear Cuenta
              </Link>
            </div>

            <button
              onClick={() => setShowAuthModal(false)}
              className="text-xs text-zinc-500 hover:text-zinc-400 transition-colors block mx-auto pt-1"
            >
              Continuar viendo las misiones
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
