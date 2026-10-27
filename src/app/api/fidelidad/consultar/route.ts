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
    const rawData = await consultarFidelidadCliente(identificador);
    if (!rawData) {
      return NextResponse.json(
        { error: 'Cliente no encontrado en el sistema POS' },
        { status: 404 }
      );
    }
    const data = (rawData as any)?.data ?? rawData;
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error al consultar fidelidad' },
      { status: 500 }
    );
  }
}
