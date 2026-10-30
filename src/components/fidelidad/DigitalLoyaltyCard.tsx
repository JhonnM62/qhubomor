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
  Bike,
  Pencil,
  AlertTriangle,
  Loader2,
  Phone,
  CreditCard,
  Link2,
  Info,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface DigitalLoyaltyCardProps {
  cliente: FidelidadClienteResponse;
  isRealtimeConnected?: boolean;
  onCedulaActualizada?: () => void;
}

export function DigitalLoyaltyCard({
  cliente,
  isRealtimeConnected = false,
  onCedulaActualizada,
}: DigitalLoyaltyCardProps) {
  const [showQrModal, setShowQrModal] = useState(false);
  const [showVincularModal, setShowVincularModal] = useState(false);
  const [tipoIdentificador, setTipoIdentificador] = useState<'WHATSAPP' | 'CEDULA'>('WHATSAPP');
  const [identificadorInput, setIdentificadorInput] = useState('');
  const [savingIdentificador, setSavingIdentificador] = useState(false);
  const [modalError, setModalError] = useState('');
  const [copied, setCopied] = useState(false);

  const qrData = JSON.stringify({
    tipo: 'FIDELIDAD_QHUBO',
    clienteId: cliente.IDcliente,
    cedula: cliente.cedula,
    contador: cliente.contador,
  });

  const whatsappDeliveryUrl = `https://wa.me/573044430427?text=${encodeURIComponent(
    cliente.granizadoGratis
      ? `¡Hola Q'hubo Mor! Acabo de completar mis 10 sellos de fidelidad con mi código #${cliente.IDcliente} (${cliente.nombre}) y quiero reclamar mi Granizado de 12oz GRATIS a domicilio.`
      : `¡Hola Q'hubo Mor! Quiero pedir a domicilio.\nCliente: ${cliente.nombre}\nCódigo POS: #${cliente.IDcliente}`
  )}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(String(cliente.cedula || cliente.IDcliente));
    setCopied(true);
    toast.success('¡Código copiado al portapapeles!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAbrirModal = (tipo: 'WHATSAPP' | 'CEDULA') => {
    setTipoIdentificador(tipo);
    setIdentificadorInput(
      tipo === 'WHATSAPP'
        ? (cliente.whatsapp || '')
        : (cliente.cedula ? String(cliente.cedula) : '')
    );
    setModalError('');
    setShowVincularModal(true);
  };

  const handleGuardarIdentificador = async () => {
    const clean = identificadorInput.trim().replace(/\D/g, '');
    if (!clean || clean.length < 5 || clean.length > 15) {
      setModalError('Ingresa un número válido (entre 5 y 15 dígitos numéricos).');
      return;
    }

    setSavingIdentificador(true);
    setModalError('');
    try {
      const res = await fetch('/api/fidelidad/vincular-identificador', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identificador: clean }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'No se pudo vincular el identificador');
      }

      toast.success(
        data.merged
          ? '¡Pedidos anteriores y sellos unificados exitosamente!'
          : '¡Identificador vinculado con éxito a tu tarjeta!'
      );
      setShowVincularModal(false);
      onCedulaActualizada?.();
    } catch (err: any) {
      setModalError(err.message || 'Error al guardar el identificador');
    } finally {
      setSavingIdentificador(false);
    }
  };

  return (
    <div className="w-full max-w-xl lg:max-w-none mx-auto">
      {/* Tarjeta Virtual Obsidian / Gold */}
      <div className="relative rounded-3xl p-6 sm:p-7 bg-gradient-to-br from-zinc-900 via-black to-zinc-950 border border-amber-500/30 shadow-2xl shadow-amber-500/10 overflow-hidden">
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
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-0.5">
              {cliente.nombre}
            </h2>
          </div>

          <div className="p-2 sm:p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Datos identificadores (Cédula, Código POS, WhatsApp, Compras Totales) */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-3 p-3 sm:p-4 rounded-2xl bg-zinc-950/70 border border-zinc-800/80">
          {/* Cédula */}
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 block">
                Cédula
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-zinc-200 truncate block mt-0.5">
                {cliente.cedula || 'No registrada'}
              </span>
            </div>
            <button
              onClick={() => handleAbrirModal('CEDULA')}
              className="mt-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 self-start"
            >
              <Pencil className="w-2.5 h-2.5" />
              <span>{cliente.cedula ? 'Modificar' : 'Vincular'}</span>
            </button>
          </div>

          {/* Código POS */}
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40 text-right sm:text-left">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 block">
              Código POS
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 block mt-0.5">
              #{cliente.IDcliente}
            </span>
          </div>

          {/* WhatsApp */}
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40 flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 block">
                WhatsApp
              </span>
              <span className="text-xs sm:text-sm font-mono font-bold text-emerald-400 truncate block mt-0.5">
                {cliente.whatsapp
                  ? cliente.whatsapp.startsWith('57')
                    ? `+57 ${cliente.whatsapp.slice(2)}`
                    : cliente.whatsapp
                  : 'No registrado'}
              </span>
            </div>
            <button
              onClick={() => handleAbrirModal('WHATSAPP')}
              className="mt-1 text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 self-start"
            >
              <Pencil className="w-2.5 h-2.5" />
              <span>{cliente.whatsapp ? 'Modificar' : 'Vincular'}</span>
            </button>
          </div>

          {/* Compras Totales */}
          <div className="p-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800/40 text-right sm:text-left flex flex-col justify-center">
            <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-500 block">
              Compras Totales
            </span>
            <span className="text-xs sm:text-sm font-mono font-bold text-zinc-200 block mt-0.5">
              {cliente.comprasTotales || cliente.contador || 0} compras
            </span>
          </div>
        </div>

        {/* Botón destacado para unificar pedidos o modificar datos */}
        <div className="relative z-10 mb-5">
          <button
            onClick={() => handleAbrirModal(cliente.whatsapp ? 'WHATSAPP' : 'CEDULA')}
            className="w-full py-2.5 px-3.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 hover:border-amber-500/50 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Link2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Vincular o Modificar Cédula / WhatsApp (Unificar Puntos)</span>
          </button>
        </div>

        {/* Cuadrícula de 10 Sellos */}
        <div className="relative z-10 mb-5">
          <StampGrid contador={cliente.contador} />
        </div>

        {/* Banner de Estado / Recompensa Activa */}
        <div className="relative z-10 mb-5">
          {cliente.granizadoGratis ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 text-black shadow-lg shadow-amber-500/20 space-y-2.5">
              <div className="flex items-center gap-3">
                <Award className="w-6 h-6 shrink-0" />
                <div className="flex-1">
                  <span className="text-xs font-black uppercase tracking-wider block">
                    ¡Granizado de 12oz GRATIS Disponible!
                  </span>
                  <span className="text-[11px] font-semibold leading-tight block">
                    ¡Ciclo de 10 sellos completado! Reclámalo gratis en caja o en tus pedidos a domicilio indicando tu código #{cliente.IDcliente}.
                  </span>
                </div>
              </div>
              <a
                href={whatsappDeliveryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2 px-3 rounded-xl bg-black hover:bg-zinc-900 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-98"
              >
                <Bike className="w-3.5 h-3.5 text-emerald-400" />
                <span>Reclamar a Domicilio por WhatsApp</span>
              </a>
            </div>
          ) : cliente.hito5 ? (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-center gap-3">
              <Sparkles className="w-5 h-5 shrink-0 text-amber-400" />
              <div className="flex-1">
                <span className="text-xs font-bold uppercase tracking-wider block text-amber-200">
                  Hito 5 Alcanzado: 15% Descuento
                </span>
                <span className="text-[11px] text-zinc-400 leading-tight block">
                  Faltan {cliente.sellosRestantesParaGranizado} compras para tu Granizado de 12oz GRATIS (válido en caja o a domicilio).
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800 text-zinc-400 flex items-center gap-3">
              <Zap className="w-5 h-5 shrink-0 text-amber-400" />
              <span className="text-xs">
                Faltan <strong className="text-zinc-200">{cliente.sellosRestantesParaGranizado} compras</strong> para tu Granizado de 12oz GRATIS (en caja o a domicilio).
              </span>
            </div>
          )}
        </div>

        {/* Acciones: Mostrar QR en Caja, Pedir a Domicilio y Copiar Código */}
        <div className="relative z-10 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => setShowQrModal(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-colors shadow-md shadow-amber-500/20"
            >
              <QrCode className="w-4 h-4" />
              <span>Mostrar QR en Caja</span>
            </button>

            <a
              href={whatsappDeliveryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 text-xs font-bold border border-emerald-500/30 transition-colors"
              title="Pedir a Domicilio por WhatsApp indicando tu código"
            >
              <Bike className="w-4 h-4" />
              <span className="hidden sm:inline">Domicilio</span>
            </a>

            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-1.5 py-3 px-3.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium border border-zinc-700 transition-colors"
              title="Copiar código para dictar"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          <div className="text-[10px] text-center text-zinc-500 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Válido para acumular y redimir tanto en caja como en domicilios por WhatsApp</span>
          </div>
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
              Presenta este código al cajero o menciónalo en tus pedidos a domicilio para registrar compras y canjear tus premios.
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

      {/* Modal para Vincular / Editar Cédula o WhatsApp con Unificación de Puntos */}
      {showVincularModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl p-6 bg-zinc-950 border border-amber-500/30 shadow-2xl text-left space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  <Link2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-white">
                    Vincular o Modificar Identificación
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Sincroniza tus compras y recupera tus puntos anteriores
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowVincularModal(false)}
                className="p-1.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Pestañas para elegir entre WhatsApp y Cédula */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-zinc-900 border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setTipoIdentificador('WHATSAPP');
                  setIdentificadorInput(cliente.whatsapp || '');
                  setModalError('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  tipoIdentificador === 'WHATSAPP'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Número WhatsApp</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setTipoIdentificador('CEDULA');
                  setIdentificadorInput(cliente.cedula ? String(cliente.cedula) : '');
                  setModalError('');
                }}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  tipoIdentificador === 'CEDULA'
                    ? 'bg-amber-500 text-black shadow-md'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Cédula de Ciudadanía</span>
              </button>
            </div>

            {modalError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{modalError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-zinc-400 block mb-1.5">
                  {tipoIdentificador === 'WHATSAPP'
                    ? 'Número de WhatsApp (Celular)'
                    : 'Número de Cédula'}
                </label>
                <input
                  type="tel"
                  inputMode="numeric"
                  placeholder={
                    tipoIdentificador === 'WHATSAPP' ? 'Ej: 3044430427' : 'Ej: 1020304050'
                  }
                  value={identificadorInput}
                  onChange={(e) => {
                    setIdentificadorInput(e.target.value.replace(/\D/g, ''));
                    setModalError('');
                  }}
                  maxLength={15}
                  className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white font-mono text-base focus:outline-none focus:border-amber-500"
                />
                <p className="text-[11px] text-zinc-500 mt-1.5">
                  Solo dígitos numéricos (entre 5 y 15 números).
                </p>
              </div>

              {/* Banner informativo de unificación */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-400 leading-relaxed flex items-start gap-2.5">
                <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-zinc-200 block mb-0.5">
                    ¿Tienes pedidos anteriores?
                  </strong>
                  <span>
                    Si ya realizaste pedidos por WhatsApp o en la caja del restaurante con este número o documento, el sistema unificará automáticamente tus compras y transferirá todos tus sellos acumulados a esta cuenta.
                  </span>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  disabled={savingIdentificador}
                  onClick={() => setShowVincularModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={savingIdentificador}
                  onClick={handleGuardarIdentificador}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs transition-colors shadow-lg shadow-amber-500/20 flex items-center justify-center gap-1.5"
                >
                  {savingIdentificador ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Sincronizando...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Guardar y Unificar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
