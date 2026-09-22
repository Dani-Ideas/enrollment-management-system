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

// UNICA fuente de verdad de los paths que usa este archivo -- cada funcion de abajo
// referencia una de estas constantes, nunca un string suelto escrito dos veces. Evita que
// el mismo path quede tipeado en mas de un lugar y se desincronice por un typo (justo el
// riesgo que se queria evitar).
const RUTAS = {
  estados: "/estados",
  sistemas: "/sistemas",
  responsables: "/responsables",
  ambientes: "/ambientes",
  catalogosImplantacion: "/catalogos-implantacion",
  implantaciones: "/implantaciones",
  endpoints: "/endpoints",
} as const;

// Chequeo SOLO en desarrollo: el backend expone que paths estan REALMENTE registrados
// (ApplicationConfig.listEndpoints(), via GET /endpoints -- ver EndpointsController.java).
// Al cargar este modulo se compara contra RUTAS de arriba y se avisa por consola si algo
// que este archivo usa ya no esta activo en el backend (ej. alguien comento la entrada en
// ApplicationConfig.REGISTRO_ACTIVO y se le olvido avisar al frontend) -- en vez de
// descubrirlo con un 404 crudo en producción. Nunca bloquea nada: si /endpoints no
// responde (backend caido, etc.) se ignora en silencio, un chequeo de desarrollo no debe
// tumbar la app.
if (import.meta.env.DEV) {
  axiosClient
    .get<string[]>(RUTAS.endpoints)
    .then(({ data: activos }) => {
      const usados = Object.values(RUTAS).filter((ruta) => ruta !== RUTAS.endpoints);
      const desactualizados = usados.filter((ruta) => !activos.includes(ruta));
      if (desactualizados.length > 0) {
        console.warn(
          `[client.ts] Estos paths que usa el frontend ya NO estan activos en el backend: ${desactualizados.join(", ")}`,
        );
      }
    })
    .catch(() => {
      /* backend no disponible todavia -- no es motivo para romper el arranque del front */
    });
}

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
  return request<EstadoDTO[]>(RUTAS.estados);
}

export function fetchSistemas(): Promise<SistemaDTO[]> {
  return request<SistemaDTO[]>(RUTAS.sistemas);
}

export function fetchResponsables(): Promise<ResponsableDTO[]> {
  return request<ResponsableDTO[]>(RUTAS.responsables);
}

export function fetchAmbientes(): Promise<AmbienteDTO[]> {
  return request<AmbienteDTO[]>(RUTAS.ambientes);
}

// "Tablas genericas": UNA sola llamada para los 4 catalogos de arriba, en vez de
// fetchEstados() + fetchSistemas() + fetchResponsables() + fetchAmbientes() por
// separado -- pensada para usarse con useQuery de TanStack Query.
export function fetchTablasImplantacion(): Promise<TablasImplantacionDTO> {
  return axiosClient.get<TablasImplantacionDTO>(RUTAS.catalogosImplantacion).then((res) => res.data);
}

// Filtros opcionales -- cada uno ausente/undefined significa "no filtrar por ese campo",
// igual que antes devolvia todo (ver FormController.listar()/ServiceArtifax.
// listarImplantaciones() en el backend, que cachean Implantacion en memoria justo para
// esto). URLSearchParams solo agrega los que de verdad vengan con valor.
export interface FiltrosImplantaciones {
  estadoId?: number;
  sistemaId?: number;
  ambienteId?: number;
}

export function fetchImplantaciones(filtros?: FiltrosImplantaciones): Promise<ImplantacionDTO[]> {
  const params = new URLSearchParams();
  if (filtros?.estadoId !== undefined) params.set("estadoId", String(filtros.estadoId));
  if (filtros?.sistemaId !== undefined) params.set("sistemaId", String(filtros.sistemaId));
  if (filtros?.ambienteId !== undefined) params.set("ambienteId", String(filtros.ambienteId));
  const query = params.size > 0 ? `?${params.toString()}` : "";
  return request<ImplantacionDTO[]>(`${RUTAS.implantaciones}${query}`);
}

export function fetchImplantacion(id: number): Promise<ImplantacionDTO> {
  return request<ImplantacionDTO>(`${RUTAS.implantaciones}/${id}`);
}

export function crearImplantacion(dto: ImplantacionRequestDTO): Promise<ImplantacionDTO> {
  return request<ImplantacionDTO>(RUTAS.implantaciones, {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export function actualizarImplantacion(
  id: number,
  dto: ImplantacionRequestDTO,
): Promise<ImplantacionDTO> {
  return request<ImplantacionDTO>(`${RUTAS.implantaciones}/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}
