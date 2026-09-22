import axios from "axios";
import type {
  AmbienteDTO,
  EstadoDTO,
  ImplantacionDTO,
  ImplantacionRequestDTO,
  ResponsableDTO,
  SistemaDTO,
  TablasImplantacionDTO,
} from "./types";

// Ruta relativa: en `npm run dev` la resuelve el proxy de vite.config.ts hacia GlassFish;
// en produccion, el frontend vive dentro del mismo WAR, asi que resuelve al mismo origen.
const API_BASE = "/SistemaMatriculas/api";

// Cliente de axios, solo para "tablas genericas" -- el resto de este archivo sigue con el
// helper request()/fetch() de siempre, sin tocarlo (mismo criterio que
// HelloJakarta-variante: axios es literal lo que se pidio para este caso puntual, no un
// reemplazo general de fetch).
const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

async function parseErrorBody(response: Response): Promise<string> {
  try {
    const body = await response.json();
    if (typeof body === "object" && body !== null) {
      return Object.values(body).join(", ");
    }
  } catch {
    // el body no era JSON valido, se usa el mensaje generico de abajo
  }
  return `${response.status} ${response.statusText}`;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!response.ok) {
    throw new Error(await parseErrorBody(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

// --- Dominio "solicitud/implantacion" -- unico dominio de negocio del front ---

export function fetchEstados(): Promise<EstadoDTO[]> {
  return request<EstadoDTO[]>("/estados");
}

export function fetchSistemas(): Promise<SistemaDTO[]> {
  return request<SistemaDTO[]>("/sistemas");
}

export function fetchResponsables(): Promise<ResponsableDTO[]> {
  return request<ResponsableDTO[]>("/responsables");
}

export function fetchAmbientes(): Promise<AmbienteDTO[]> {
  return request<AmbienteDTO[]>("/ambientes");
}

// "Tablas genericas": UNA sola llamada para los 4 catalogos de arriba, en vez de
// fetchEstados() + fetchSistemas() + fetchResponsables() + fetchAmbientes() por
// separado -- pensada para usarse con useQuery de TanStack Query.
export function fetchTablasImplantacion(): Promise<TablasImplantacionDTO> {
  return axiosClient.get<TablasImplantacionDTO>("/catalogos-implantacion").then((res) => res.data);
}

export function fetchImplantaciones(): Promise<ImplantacionDTO[]> {
  return request<ImplantacionDTO[]>("/implantaciones");
}

export function fetchImplantacion(id: number): Promise<ImplantacionDTO> {
  return request<ImplantacionDTO>(`/implantaciones/${id}`);
}

export function crearImplantacion(dto: ImplantacionRequestDTO): Promise<ImplantacionDTO> {
  return request<ImplantacionDTO>("/implantaciones", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function actualizarImplantacion(
  id: number,
  dto: ImplantacionRequestDTO,
): Promise<ImplantacionDTO> {
  return request<ImplantacionDTO>(`/implantaciones/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}
