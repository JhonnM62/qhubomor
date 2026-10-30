import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { vincularIdentificadorCliente } from '@/lib/erp-client';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Debes iniciar sesión para vincular tus pedidos anteriores o identificación.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { identificador } = body;

    if (!identificador || typeof identificador !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Número de WhatsApp, celular o cédula inválido.' },
        { status: 400 }
      );
    }

    const cleanId = identificador.trim().replace(/\D/g, '');
    if (cleanId.length < 5 || cleanId.length > 15) {
      return NextResponse.json(
        { success: false, error: 'El número debe contener entre 5 y 15 dígitos numéricos.' },
        { status: 400 }
      );
    }

    const resErp = await vincularIdentificadorCliente({
      email: session.user.email,
      identificador: cleanId,
      nombre: session.user.name || undefined,
    });

    if (!resErp.success) {
      return NextResponse.json(
        { success: false, error: resErp.error || 'Error al vincular identificador en el sistema.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resErp.message || 'Identificador vinculado exitosamente.',
      cliente: resErp.cliente,
      merged: resErp.merged,
    });
  } catch (error: any) {
    console.error('Error en /api/fidelidad/vincular-identificador:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
