// Cliente para consultar la API del ERP Q'hubo Mor
const ERP_BASE_URL =
  process.env.NEXT_PUBLIC_ERP_API_URL ||
  process.env.ERP_API_URL ||
  'https://api-qhubomor.autosystemprojects.site/api/v1';

export interface VentaItemFidelidad {
  IDventas: string;
  pedido: string;
  totalInput: number;
  fechaYHora: string | null;
  estado: string | null;
  compras: string | null;
  productos: Array<{
    nombre: string;
    cantidad: number;
    precioTotal: number;
  }>;
}

export interface FidelidadClienteResponse {
  IDcliente: number;
  nombre: string;
  cedula: string | null;
  whatsapp: string | null;
  contador: number;
  comprasTotales: number;
  hito5: boolean;
  hito10: boolean;
  granizadoGratis: boolean;
  sellosRestantesParaGranizado: number;
  ultimasVentas: VentaItemFidelidad[];
}

export async function consultarFidelidadCliente(
  identificador: string
): Promise<FidelidadClienteResponse | null> {
  const clean = identificador.trim();
  if (!clean) return null;

  try {
    const res = await fetch(`${ERP_BASE_URL}/clientes/fidelidad/${encodeURIComponent(clean)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 10 },
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Error ${res.status} al consultar fidelidad`);
    }

    const data: FidelidadClienteResponse = await res.json();
    return data;
  } catch (error) {
    console.error('Error conectando con API ERP:', error);
    return null;
  }
}
