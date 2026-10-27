import { NextRequest, NextResponse } from 'next/server';
import { consultarFidelidadCliente } from '@/lib/erp-client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const identificador = searchParams.get('identificador');

  if (!identificador) {
    return NextResponse.json(
      { error: 'Parámetro identificador requerido' },
      { status: 400 }
    );
  }

  try {
    const data = await consultarFidelidadCliente(identificador);
    if (!data) {
      return NextResponse.json(
        { error: 'Cliente no encontrado en el sistema POS' },
        { status: 404 }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al consultar fidelidad' },
      { status: 500 }
    );
  }
}
