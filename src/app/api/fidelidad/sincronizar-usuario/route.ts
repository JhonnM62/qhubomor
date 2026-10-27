import { NextRequest, NextResponse } from 'next/server';
import { sincronizarUsuarioCliente } from '@/lib/erp-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, nombre } = body;

    if (!email || !email.toString().trim()) {
      return NextResponse.json(
        { error: 'El email del usuario es requerido' },
        { status: 400 }
      );
    }

    const result = await sincronizarUsuarioCliente({
      email: email.toString().trim(),
      nombre: nombre?.trim(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'No se pudo sincronizar el cliente con el ERP' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error interno al sincronizar el cliente' },
      { status: 500 }
    );
  }
}
