import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { eliminarCuentaCliente } from '@/lib/erp-client';

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'No estás autenticado.' },
        { status: 401 }
      );
    }

    const email = session.user.email.trim().toLowerCase();
    const codigoCliente = (session as any)?.codigoCliente
      ? Number((session as any).codigoCliente)
      : undefined;

    // 1. Eliminar cliente y sus sellos de fidelidad en el ERP (conservando ventas históricas)
    await eliminarCuentaCliente(email, codigoCliente);

    // 2. Eliminar usuario y sus registros en la base de datos web de Q'hubo Mor (cascada)
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (user) {
      await prisma.user.delete({
        where: { id: user.id },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Tu cuenta, tarjeta de fidelidad y sellos han sido eliminados correctamente.',
    });
  } catch (error: any) {
    console.error('Error al eliminar cuenta de usuario:', error);
    return NextResponse.json(
      { error: error?.message || 'Error interno al eliminar la cuenta.' },
      { status: 500 }
    );
  }
}
