import { NextRequest, NextResponse } from 'next/server';
import { reclamarMisionCliente } from '@/lib/erp-client';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { cedula, nombre, whatsapp, tipoMision, capturas } = body;

    if (!cedula || !cedula.toString().trim()) {
      return NextResponse.json(
        { error: 'El número de cédula o documento es requerido' },
        { status: 400 }
      );
    }

    if (!tipoMision || !['GOOGLE_REVIEW', 'REDES_SOCIALES'].includes(tipoMision)) {
      return NextResponse.json(
        { error: 'Tipo de misión inválido' },
        { status: 400 }
      );
    }

    const result = await reclamarMisionCliente({
      cedula: cedula.toString().trim(),
      nombre: nombre?.trim(),
      whatsapp: whatsapp?.trim(),
      tipoMision,
      capturas,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'No se pudo acreditar el sello' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Error interno al procesar la misión' },
      { status: 500 }
    );
  }
}
