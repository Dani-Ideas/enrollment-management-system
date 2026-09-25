import axios, { type AxiosRequestConfig } from "axios";
import type {
  AmbienteDTO,
  FormacionComplementariaDTO,
  FormacionComplementariaRequestDTO,
  EstadoDTO,
  InscripcionDTO,
  InscripcionRequestDTO,
  ResponsableDTO,
  SistemaDTO,
  TablasInscripcionDTO,
} from "./types";

// Ruta relativa: en `npm run dev` la resuelve el proxy de vite.config.ts hacia GlassFish;
// en produccion, el frontend vive dentro del mismo WAR, asi que resuelve al mismo origen.
const API_BASE = "/SistemaMatriculas/api";

// UN SOLO cliente de axios para TODO este archivo, sin excepcion -- antes solo lo usaba
// fetchTablasInscripcion() y el resto seguia con fetch()/RequestInit; ahora todas las
// funciones de abajo pasan por request(), que a su vez pasa por este cliente.
const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// UNICA fuente de verdad de los paths que usa este archivo -- cada funcion de abajo
// referencia una de estas constantes, nunca un string suelto escrito dos veces. Evita que
// el mismo path quede tipeado en mas de un lugar y se desincronice por un typo.
const RUTAS = {
  estados: "/estados",
  sistemas: "/sistemas",
  responsables: "/responsables",
  ambientes: "/ambientes",
  catalogosInscripcion: "/catalogos-inscripcion",
  inscripciones: "/inscripciones",
  formacionesComplementarias: "/formaciones-complementarias",
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

// Arma un mensaje legible a partir de un error de axios -- reemplaza al parseErrorBody()
// que antes leia el body con response.json() (API de fetch); con axios el body de un
// error ya viene parseado en error.response.data, no hace falta volver a leerlo.
function mensajeDeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body: unknown = error.response?.data;
    if (typeof body === "object" && body !== null) {
      const valores = Object.values(body as Record<string, unknown>);
      if (valores.length > 0) {
        return valores.join(", ");
      }
    }
    if (error.response) {
      return `${error.response.status} ${error.response.statusText}`;
    }
    return error.message;
  }
  return error instanceof Error ? error.message : String(error);
}

// Unico punto de salida hacia el backend para todo este archivo -- GET/POST/PUT, todos
// pasan por aqui, todos por axiosClient. "config" es el AxiosRequestConfig normal
// (method/data/params/...); por defecto es GET si no se especifica method.
async function request<T>(path: string, config?: AxiosRequestConfig): Promise<T> {
  try {
    const response = await axiosClient.request<T>({ url: path, ...config });
    return response.data;
  } catch (error) {
    throw new Error(mensajeDeError(error));
  }
}

// --- Dominio "solicitud/inscripcion" -- unico dominio de negocio del front ---

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
// separado. Es la que mas se usa en todo el front: el 100% de los PUT/POST de
// inscripciones arman su InscripcionRequestDTO resolviendo nombre -> id contra estos
// mismos catalogos (ver InscripcionWizard.tsx/FormularioPagoPage.tsx).
export function fetchTablasInscripcion(): Promise<TablasInscripcionDTO> {
  return request<TablasInscripcionDTO>(RUTAS.catalogosInscripcion);
}

// UNICA fuente de verdad de como se pide/cachea "tablas genericas" en TODA la app --
// HomePage.tsx la precarga apenas se entra al sitio (queryClient.prefetchQuery con este
// mismo objeto), y FormularioPagoPage.tsx/InscripcionWizard.tsx usan useQuery con este
// MISMO objeto. TanStack Query identifica una entrada de cache por su queryKey -- si cada
// lugar escribiera ["catalogos-inscripcion"] a mano, un solo caracter distinto (o incluso
// nada distinto pero por las dudas) rompe el "compartir cache" sin avisar. Exportando un
// solo objeto y haciendo spread (...CATALOGOS_INSCRIPCION_QUERY) en cada useQuery/
// prefetchQuery, es IMPOSIBLE que se desincronicen.
export const CATALOGOS_INSCRIPCION_QUERY = {
  queryKey: ["catalogos-inscripcion"] as const,
  queryFn: fetchTablasInscripcion,
  staleTime: 5 * 60 * 1000,
};

// Filtros opcionales -- cada uno ausente/undefined significa "no filtrar por ese campo",
// igual que antes devolvia todo (ver FormController.listar()/ServiceArtifax.
// listarInscripciones() en el backend, que cachean Inscripcion en memoria justo para
// esto). axios omite del query string los params en undefined/null solo -- no hace falta
// armar el URLSearchParams a mano.
export interface FiltrosInscripciones {
  estadoId?: number;
  sistemaId?: number;
  ambienteId?: number;
}

export function fetchInscripciones(filtros?: FiltrosInscripciones): Promise<InscripcionDTO[]> {
  return request<InscripcionDTO[]>(RUTAS.inscripciones, {
    params: {
      estadoId: filtros?.estadoId,
      sistemaId: filtros?.sistemaId,
      ambienteId: filtros?.ambienteId,
    },
  });
}

export function fetchInscripcion(id: number): Promise<InscripcionDTO> {
  return request<InscripcionDTO>(`${RUTAS.inscripciones}/${id}`);
}

export function crearInscripcion(dto: InscripcionRequestDTO): Promise<InscripcionDTO> {
  return request<InscripcionDTO>(RUTAS.inscripciones, { method: "POST", data: dto });
}

export function actualizarInscripcion(
  id: number,
  dto: InscripcionRequestDTO,
): Promise<InscripcionDTO> {
  return request<InscripcionDTO>(`${RUTAS.inscripciones}/${id}`, { method: "PUT", data: dto });
}

// --- "Formaciones complementarias" 1:N ligadas a una Inscripcion por FK (inscripcionId) ---
// Endpoint propio, aparte de /inscripciones -- se piden solo cuando hacen falta: al
// crear/editar una Inscripcion, o al abrir "Ver detalle" en la lista.

export function fetchFormacionesComplementariasPorInscripcion(inscripcionId: number): Promise<FormacionComplementariaDTO[]> {
  return request<FormacionComplementariaDTO[]>(RUTAS.formacionesComplementarias, { params: { inscripcionId } });
}

export function crearFormacionComplementaria(dto: FormacionComplementariaRequestDTO): Promise<FormacionComplementariaDTO> {
  return request<FormacionComplementariaDTO>(RUTAS.formacionesComplementarias, { method: "POST", data: dto });
}

export function actualizarFormacionComplementaria(id: number, dto: FormacionComplementariaRequestDTO): Promise<FormacionComplementariaDTO> {
  return request<FormacionComplementariaDTO>(`${RUTAS.formacionesComplementarias}/${id}`, { method: "PUT", data: dto });
}

export function eliminarFormacionComplementaria(id: number): Promise<void> {
  return request<void>(`${RUTAS.formacionesComplementarias}/${id}`, { method: "DELETE" });
}
