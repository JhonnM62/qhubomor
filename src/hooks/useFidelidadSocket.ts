'use client';

import { useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

export interface FidelidadSocketEvent {
  clienteId: number;
  cedula: string | null;
  nombre?: string | null;
  contador: number;
  comprasTotales: number;
  hito5: boolean;
  hito10: boolean;
  granizadoDisponible: boolean;
  descuentoIntermedioDisponible: boolean;
  timestamp: string;
}

export function useFidelidadSocket(
  identificador?: string,
  onUpdate?: (data: FidelidadSocketEvent) => void
) {
  const [lastEvent, setLastEvent] = useState<FidelidadSocketEvent | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!identificador) return;

    const erpSocketUrl =
      process.env.NEXT_PUBLIC_ERP_SOCKET_URL ||
      'https://backendnestpv.autosystemprojects.site/pos';

    const socket = io(erpSocketUrl, {
      transports: ['websocket', 'polling'],
      auth: {
        role: 'fidelidad',
        token: 'fidelidad-guest',
      },
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('joinFidelidad', {
        cedula: identificador,
        clienteId: !isNaN(Number(identificador)) ? Number(identificador) : undefined,
      });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('fidelidad:actualizada', (data: FidelidadSocketEvent) => {
      const matchCedula = data.cedula && String(data.cedula) === String(identificador);
      const matchId = data.clienteId && String(data.clienteId) === String(identificador);

      if (matchCedula || matchId) {
        setLastEvent(data);
        if (onUpdate) {
          onUpdate(data);
        }
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [identificador, onUpdate]);

  return { lastEvent, isConnected };
}
