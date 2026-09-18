import type {
  AmbienteDTO,
  EstadoDTO,
  ImplantacionDTO,
  ImplantacionRequestDTO,
  ResponsableDTO,
  SistemaDTO,
} from "./types";

// Ruta relativa: en `npm run dev` la resuelve el proxy de vite.config.ts hacia GlassFish;
// en produccion, el frontend vive dentro del mismo WAR, asi que resuelve al mismo origen.
const API_BASE = "/SistemaMatriculas/api";

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
