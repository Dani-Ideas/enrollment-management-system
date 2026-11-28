import axios, { type AxiosRequestConfig } from "axios";
import { queryOptions } from "@tanstack/react-query";
import type {
  AmbienteDTO,
  AvisoVersionDTO,
  AvisoVersionRequestDTO,
  ChecklistItemDTO,
  ChecklistItemRequestDTO,
  ChecklistTemplateDTO,
  ChecklistTemplateRequestDTO,
  DocumentoDTO,
  DocumentoRequestDTO,
  EstadoDTO,
  PruebaDTO,
  PruebaRequestDTO,
  ResponsableDTO,
  SistemaDTO,
  SolicitudConFormacionesDTO,
  SolicitudConFormacionesRequestDTO,
  SolicitudConPanelesDTO,
  SolicitudDTO,
  TablasInscripcionDTO,
} from "./types";

const API_BASE = "/SistemaMatriculas/api";

const axiosClient = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

const RUTAS = {
  estados: "/estados",
  sistemas: "/sistemas",
  responsables: "/responsables",
  ambientes: "/ambientes",
  catalogosInscripcion: "/catalogos-inscripcion",
  solicitudes: "/solicitudes",
  plantillasChecklist: "/plantillas-checklist",
  endpoints: "/endpoints",
} as const;

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
//
// Todos los errores del backend llegan como Problem Details (RFC 9457): "detail" es el
// mensaje y "errores" (solo en un 400 de validacion) trae un mensaje por campo.
function mensajeDeError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data as ProblemDetails | undefined;
    if (typeof body === "object" && body !== null && "status" in body) {
      const porCampo = Object.entries(body.errores ?? {}).map(([campo, msg]) => `${campo}: ${msg}`);
      const partes = [body.detail ?? body.title, ...porCampo].filter(Boolean);
      if (partes.length > 0) {
        return partes.join(", ");
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
// Espejo de general/ProblemDetails.java.
interface ProblemDetails {
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  errores?: Record<string, string>;
}

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

// "Tablas genericas": UNA sola llamada para los catalogos de arriba, en vez de uno por
// separado. Es la que mas se usa en todo el front: el 100% de los PUT/POST de solicitudes
// arman su SolicitudRequestDTO resolviendo nombre -> id contra estos mismos catalogos (ver
// useInscripcionForm.ts).
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
// queryOptions(): sin el, TypeScript ensancha 'static' a string y useQuery lo rechaza.
export const CATALOGOS_INSCRIPCION_QUERY = queryOptions({
  queryKey: ["catalogos-inscripcion"] as const,
  queryFn: fetchTablasInscripcion,
  staleTime: "static",
});

// --- Solicitudes (Primaria/Secundaria/Universidad unificadas) ---
//
// Reemplaza al viejo modelo de firmas booleanas por nivel. "etapa" (dentro de
// SolicitudRequestDTO) distingue el nivel; "solicitudAnterior" encadena contra el id REAL
// de la solicitud previa (ya no un id de linaje compartido) -- el backend responde 409 si
// la cadena no es valida o si el nivel anterior no tiene su VoBo completo.

export function fetchSolicitudes(): Promise<SolicitudDTO[]> {
  return request<SolicitudDTO[]>(RUTAS.solicitudes);
}

// Trae la solicitud + todos sus paneles (checklist/pruebas/documento/avisoVersiones/voBo +
// formaciones complementarias) en una sola llamada -- reemplaza a los viejos
// fetchInscripcionSecundaria/fetchInscripcionUniversidad/fetchDiplomaPrimaria por separado.
export function fetchSolicitud(id: number): Promise<SolicitudConPanelesDTO> {
  return request<SolicitudConPanelesDTO>(`${RUTAS.solicitudes}/${id}`);
}

export function crearSolicitud(dto: SolicitudConFormacionesRequestDTO): Promise<SolicitudConFormacionesDTO> {
  return request<SolicitudConFormacionesDTO>(RUTAS.solicitudes, { method: "POST", data: dto });
}

export function actualizarSolicitud(
  id: number,
  dto: SolicitudConFormacionesRequestDTO,
): Promise<SolicitudConFormacionesDTO> {
  return request<SolicitudConFormacionesDTO>(`${RUTAS.solicitudes}/${id}`, { method: "PUT", data: dto });
}

// --- Checklist/pruebas/documento/aviso de versiones de una solicitud ---
//
// No van en RUTAS (ese objeto es de paths fijos, estos llevan el id de la solicitud) -- el
// chequeo de endpoints activos de arriba (DEV) por eso no puede validarlos, es un falso
// positivo inofensivo si alguna vez aparece en consola.

export function fetchChecklist(solicitudId: number): Promise<ChecklistItemDTO[]> {
  return request<ChecklistItemDTO[]>(`${RUTAS.solicitudes}/${solicitudId}/checklist`);
}

export function crearChecklistItem(solicitudId: number, dto: ChecklistItemRequestDTO): Promise<ChecklistItemDTO> {
  return request<ChecklistItemDTO>(`${RUTAS.solicitudes}/${solicitudId}/checklist`, { method: "POST", data: dto });
}

export function actualizarChecklistItem(
  solicitudId: number,
  itemId: number,
  dto: ChecklistItemRequestDTO,
): Promise<ChecklistItemDTO> {
  return request<ChecklistItemDTO>(`${RUTAS.solicitudes}/${solicitudId}/checklist/${itemId}`, {
    method: "PUT",
    data: dto,
  });
}

export function eliminarChecklistItem(solicitudId: number, itemId: number): Promise<void> {
  return request<void>(`${RUTAS.solicitudes}/${solicitudId}/checklist/${itemId}`, { method: "DELETE" });
}

// --- Plantillas de checklist ---
//
// Presets globales: no llevan id de solicitud, por eso si van en RUTAS (y el chequeo DEV de
// endpoints activos de arriba las valida de verdad). El id de cada fila nunca sale del
// backend: una plantilla se identifica por su NOMBRE, que es lo que viaja en la URL.

export function fetchChecklistTemplates(): Promise<ChecklistTemplateDTO[]> {
  return request<ChecklistTemplateDTO[]>(RUTAS.plantillasChecklist);
}

export function crearChecklistTemplate(dto: ChecklistTemplateRequestDTO): Promise<ChecklistTemplateDTO> {
  return request<ChecklistTemplateDTO>(RUTAS.plantillasChecklist, { method: "POST", data: dto });
}

export function eliminarChecklistTemplate(tipoArquitecturaId: number, nombre: string): Promise<void> {
  return request<void>(`${RUTAS.plantillasChecklist}/${tipoArquitecturaId}/${encodeURIComponent(nombre)}`, {
    method: "DELETE",
  });
}

// Misma razon que CATALOGOS_INSCRIPCION_QUERY: una sola fuente de verdad de la queryKey,
// para que invalidar despues de guardar una plantilla refresque TODOS los selects abiertos.
// Sin staleTime "static": las plantillas se crean desde la propia pantalla.
export const PLANTILLAS_CHECKLIST_QUERY = queryOptions({
  queryKey: ["plantillas-checklist"] as const,
  queryFn: fetchChecklistTemplates,
});

export function fetchPruebas(solicitudId: number): Promise<PruebaDTO[]> {
  return request<PruebaDTO[]>(`${RUTAS.solicitudes}/${solicitudId}/pruebas`);
}

export function crearPruebaItem(solicitudId: number, dto: PruebaRequestDTO): Promise<PruebaDTO> {
  return request<PruebaDTO>(`${RUTAS.solicitudes}/${solicitudId}/pruebas`, { method: "POST", data: dto });
}

export function actualizarPruebaItem(
  solicitudId: number,
  itemId: number,
  dto: PruebaRequestDTO,
): Promise<PruebaDTO> {
  return request<PruebaDTO>(`${RUTAS.solicitudes}/${solicitudId}/pruebas/${itemId}`, { method: "PUT", data: dto });
}

export function eliminarPruebaItem(solicitudId: number, itemId: number): Promise<void> {
  return request<void>(`${RUTAS.solicitudes}/${solicitudId}/pruebas/${itemId}`, { method: "DELETE" });
}

// 1:1 -- GET + PUT-upsert, sin POST/DELETE separados (mismo criterio que el backend).
export function fetchDocumento(solicitudId: number): Promise<DocumentoDTO | null> {
  return request<DocumentoDTO | null>(`${RUTAS.solicitudes}/${solicitudId}/documento`);
}

export function guardarDocumento(solicitudId: number, dto: DocumentoRequestDTO): Promise<DocumentoDTO> {
  return request<DocumentoDTO>(`${RUTAS.solicitudes}/${solicitudId}/documento`, { method: "PUT", data: dto });
}

export function fetchAvisoVersiones(solicitudId: number): Promise<AvisoVersionDTO | null> {
  return request<AvisoVersionDTO | null>(`${RUTAS.solicitudes}/${solicitudId}/aviso-versiones`);
}

export function guardarAvisoVersiones(solicitudId: number, dto: AvisoVersionRequestDTO): Promise<AvisoVersionDTO> {
  return request<AvisoVersionDTO>(`${RUTAS.solicitudes}/${solicitudId}/aviso-versiones`, {
    method: "PUT",
    data: dto,
  });
}
