import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { actualizarCedulaCliente } from '@/lib/erp-client';

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: 'Debes iniciar sesión para vincular tu cédula.' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { cedula } = body;

    if (!cedula || typeof cedula !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Número de cédula inválido.' },
        { status: 400 }
      );
    }

    const cleanCedula = cedula.trim().replace(/\D/g, '');
    if (cleanCedula.length < 5 || cleanCedula.length > 15) {
      return NextResponse.json(
        { success: false, error: 'La cédula debe contener entre 5 y 15 dígitos numéricos.' },
        { status: 400 }
      );
    }

    const identificador =
      (session as any).codigoCliente ||
      session.user.email ||
      (session as any).userId;

    if (!identificador) {
      return NextResponse.json(
        { success: false, error: 'No se pudo identificar tu cuenta de cliente.' },
        { status: 400 }
      );
    }

    const resErp = await actualizarCedulaCliente(String(identificador), cleanCedula);

    if (!resErp.success) {
      return NextResponse.json(
        { success: false, error: resErp.error || 'Error al vincular cédula en el sistema.' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: resErp.message || 'Cédula vinculada exitosamente.',
      cedula: resErp.cedula || cleanCedula,
    });
  } catch (error: any) {
    console.error('Error en /api/fidelidad/actualizar-cedula:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
