// Cliente para consultar la API del ERP Q'hubo Mor
const ERP_BASE_URL =
  process.env.NEXT_PUBLIC_ERP_API_URL ||
  process.env.ERP_API_URL ||
  'https://backendnestpv.autosystemprojects.site/api/v1';

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
  misionGoogleCompletada?: boolean;
  misionRedesCompletada?: boolean;
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
      cache: 'no-store',
    });

    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Error ${res.status} al consultar fidelidad`);
    }

    const json = await res.json();
    const data: FidelidadClienteResponse = json?.data ?? json;
    return data;
  } catch (error) {
    console.error('Error conectando con API ERP:', error);
    return null;
  }
}

export interface CapturaEvidenciaItem {
  plataforma: 'GOOGLE_MAPS' | 'INSTAGRAM' | 'TIKTOK' | 'FACEBOOK' | string;
  base64: string;
}

export interface ReclamarMisionPayload {
  cedula: string;
  nombre?: string;
  whatsapp?: string;
  tipoMision: 'GOOGLE_REVIEW' | 'REDES_SOCIALES';
  capturas?: CapturaEvidenciaItem[];
}

export async function reclamarMisionCliente(
  payload: ReclamarMisionPayload
): Promise<{ success: boolean; cliente?: any; mensaje?: string; error?: string }> {
  try {
    const res = await fetch(`${ERP_BASE_URL}/clientes/fidelidad/reclamar-mision`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json?.message || json?.error || 'Error al acreditar el sello de la misión',
      };
    }

    const data = json?.data ?? json;
    return {
      success: true,
      cliente: data?.cliente ?? data,
      mensaje: data?.mensaje || 'Sello acreditado con éxito',
    };
  } catch (err: any) {
    console.error('Error al reclamar misión en ERP:', err);
    return {
      success: false,
      error: err.message || 'Error de conexión con el servidor POS',
    };
  }
}

export interface SincronizarUsuarioPayload {
  email: string;
  nombre?: string;
}

export interface SincronizarUsuarioResponse {
  success: boolean;
  cliente?: {
    IDcliente: number;
    nombre: string;
    email?: string;
    contador: number;
    comprasTotales: number;
    misionGoogleCompletada?: boolean;
    misionRedesCompletada?: boolean;
    isNew?: boolean;
  };
  error?: string;
}

export async function sincronizarUsuarioCliente(
  payload: SincronizarUsuarioPayload
): Promise<SincronizarUsuarioResponse> {
  try {
    const res = await fetch(`${ERP_BASE_URL}/clientes/fidelidad/sincronizar-usuario`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json?.message || json?.error || 'Error al sincronizar cliente en ERP',
      };
    }

    const data = json?.data ?? json;
    return {
      success: true,
      cliente: data,
    };
  } catch (err: any) {
    console.error('Error al sincronizar usuario con ERP:', err);
    return {
      success: false,
      error: err.message || 'Error de conexión con ERP',
    };
  }
}

export async function eliminarCuentaCliente(
  email: string,
  codigoCliente?: number
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const res = await fetch(`${ERP_BASE_URL}/clientes/fidelidad/eliminar-cuenta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, codigoCliente }),
    });

    const json = await res.json();
    if (!res.ok) {
      return {
        success: false,
        error: json?.message || json?.error || 'Error al eliminar cliente en ERP',
      };
    }

    return {
      success: true,
      message: json?.message || 'Cuenta y sellos eliminados exitosamente del ERP',
    };
  } catch (err: any) {
    console.error('Error al eliminar cuenta en ERP:', err);
    return {
      success: false,
      error: err.message || 'Error de conexión con el servidor ERP',
    };
  }
}
