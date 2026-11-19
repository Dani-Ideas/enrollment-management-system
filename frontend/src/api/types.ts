// Dominio "solicitud/inscripcion" -- unico dominio de negocio del frontend
// (el dominio academico de estudiantes/materias/clases/matriculas se retiro
// del front, ver bitacora). Se llama "Inscripcion" (no "Solicitud") para no
// chocar con la tabla SOL_SOLICITUD, que es otra cosa y no se toco.

export interface EstadoDTO {
  id: number;
  estado: string;
}

export interface SistemaDTO {
  id: number;
  nombre: string;
}

export interface ResponsableDTO {
  id: number;
  nombreLargo: string;
}

export interface AmbienteDTO {
  id: number;
  nombre: string;
}

// Forma de SALIDA -- aplanada a texto (igual que el SELECT original), no trae
// objetos anidados. Espejo de InscripcionDto.java -- este endpoint (/inscripciones) queda
// SOLO para leer/editar lo creado antes del modelo de SOLICITUDES de mas abajo; las altas
// nuevas de cualquier nivel usan SolicitudDTO/RUTAS.solicitudes, no esto.
export interface InscripcionDTO {
  id: number;
  estado: string;
  sistema: string;
  jefeCarrera: string;
  maestro: string;
  carrera: string;
  ambiente: string;
  proyecto: string;
  version: string;
  descripcion: string | null;
  fechaInscripcionPlanteada: string;
  fechaInscripcionReal: string | null;
}

export interface EtapaInscripcionDTO {
  id: number;
  nombre: string;
  orden: number;
}

export interface TipoPruebaDTO {
  id: number;
  nombre: string;
}

// "Tablas genericas": los catalogos de arriba en un solo bundle -- espejo de
// TablasInscripcionDto.java del backend. Reemplaza los GET separados por uno.
export interface TablasInscripcionDTO {
  estados: EstadoDTO[];
  sistemas: SistemaDTO[];
  responsables: ResponsableDTO[];
  ambientes: AmbienteDTO[];
  etapas: EtapaInscripcionDTO[];
  tiposPrueba: TipoPruebaDTO[];
}

// "Formaciones complementarias" ligadas 1:N a una Inscripcion por FK (inscripcionId) -- espejo de
// FormacionComplementariaDto.java. A diferencia de InscripcionDTO, aqui SI se expone el id crudo del
// FK (no hay nada que aplanar a texto: apunta de vuelta a la Inscripcion dueña, no a un
// catalogo con nombre legible).
export interface FormacionComplementariaDTO {
  id: number;
  inscripcionId: number;
  descripcion: string;
}

// Forma de ENTRADA -- espejo de FormacionComplementariaRequestDto.java. "id" identifica
// cual fila editar dentro de la lista compuesta (null = es nueva, se crea). La inscripcion
// duena la decide el backend (URL del PUT o la recien creada en el POST).
export interface FormacionComplementariaRequestDTO {
  id: number | null;
  descripcion: string;
}

// --- Solicitudes (Primaria/Secundaria/Universidad unificadas) + checklist/pruebas/
// documento/aviso de versiones/VoBo -- espejo de los DTO nuevos del backend. Reemplaza al
// viejo modelo de firmas booleanas fijas por nivel (Diploma*DTO/InscripcionSecundaria*/
// InscripcionUniversidad*/CadenaDiplomas*, ya retirados) Y al modelo legacy de
// InscripcionConFormacionComplementaria*DTO/RUTAS.inscripciones -- "lista"/"actualizar"/
// "consultar" leen y escriben contra esto ahora, no contra la tabla INSCRIPCION vieja.
//
// SolicitudDTO unifica los 3 niveles: "etapa" distingue cual es.

// Espejo de SolNInscripcionDto.java.
export interface SolicitudDTO {
  id: number;
  etapa: string;
  solicitudAnteriorId: number | null;
  estado: string;
  sistema: string;
  jefeCarrera: string;
  maestro: string;
  carrera: string;
  ambiente: string;
  proyecto: string;
  version: string;
  descripcion: string | null;
  fechaInscripcionPlanteada: string;
  fechaInscripcionReal: string | null;
}

// Espejo de SolNInscripcionRequestDto.java -- "solicitudAnterior" null SOLO para la primera
// etapa (Primaria); el backend responde 409 si la relacion con "etapa" no es consistente.
export interface SolicitudRequestDTO {
  etapa: number;
  solicitudAnterior: number | null;
  estado: number;
  sistema: number;
  jefeCarrera: number;
  maestro: number;
  carrera: number;
  ambiente: number;
  proyecto: string;
  version: string;
  descripcion: string | null;
  fechaInscripcionPlanteada: string;
  fechaInscripcionReal: string | null;
}

// Espejo de SolNInscripcionConFormacionesDto.java -- forma de SALIDA de POST/PUT /solicitudes.
export interface SolicitudConFormacionesDTO {
  solicitud: SolicitudDTO;
  formacionesComplementarias: FormacionComplementariaDTO[];
}

// Espejo de SolNInscripcionConFormacionesRequestDto.java -- mismo criterio que
// InscripcionConFormacionComplementariaRequestDTO: formacionesComplementarias es opcional en
// el PUT (null/undefined = no tocar, una lista, aunque vacia, = la lista completa que debe
// quedar).
export interface SolicitudConFormacionesRequestDTO {
  solicitud: SolicitudRequestDTO;
  formacionesComplementarias?: FormacionComplementariaRequestDTO[];
}

// Espejo de InscripcionChecklistDto.java.
export interface ChecklistItemDTO {
  id: number;
  solicitudId: number;
  etapa: string;
  estado: string;
  responsable: string;
  seccion: string;
  actividad: string;
  descripcion: string;
  conexion: string;
  comentario: string | null;
}

// Espejo de InscripcionChecklistRequestDto.java -- sin "solicitud" ni "etapa": la solicitud
// la fija la URL, la etapa se copia de la propia solicitud en el backend.
export interface ChecklistItemRequestDTO {
  estado: number;
  responsable: number;
  seccion: string;
  actividad: string;
  descripcion: string;
  conexion: string;
  comentario: string | null;
}

// Espejo de InscripcionPruebaDto.java.
export interface PruebaDTO {
  id: number;
  solicitudId: number;
  tipoPrueba: string;
  estado: string;
  ruta: string;
  alcance: string;
  resultado: string;
  comentario: string;
}

// Espejo de InscripcionPruebaRequestDto.java.
export interface PruebaRequestDTO {
  tipoPrueba: number;
  estado: number;
  ruta: string;
  alcance: string;
  resultado: string;
  comentario: string;
}

// Espejo de InscripcionDocumentoDto.java -- 1:1 con la solicitud.
export interface DocumentoDTO {
  id: number;
  solicitudId: number;
  completo: boolean;
  comentario: string;
}

// Espejo de InscripcionDocumentoRequestDto.java -- PUT-upsert (ver RUTAS/guardarDocumento).
export interface DocumentoRequestDTO {
  completo: boolean;
  comentario: string;
}

// Espejo de InscripcionAvisoVersionDto.java -- 1:1 con la solicitud.
export interface AvisoVersionDTO {
  id: number;
  solicitudId: number;
  reporte: string;
}

export interface AvisoVersionRequestDTO {
  reporte: string;
}

// Espejo de InscripcionVoBoDto.java -- sin RequestDTO: los 3 booleanos siempre los calcula
// el backend (InscripcionVoBoRecalculador), el front nunca los recalcula ni los manda.
export interface VoBoDTO {
  solicitudId: number;
  pruebas: boolean;
  checklist: boolean;
  documentacion: boolean;
}

// Espejo de SolNInscripcionConPanelesDto.java -- forma de SALIDA de GET /solicitudes/{id}.
// documento/avisoVersiones/voBo son null si todavia no se llenaron (1:1 opcional).
export interface SolicitudConPanelesDTO {
  solicitud: SolicitudDTO;
  checklist: ChecklistItemDTO[];
  pruebas: PruebaDTO[];
  documento: DocumentoDTO | null;
  avisoVersiones: AvisoVersionDTO | null;
  voBo: VoBoDTO | null;
  formacionesComplementarias: FormacionComplementariaDTO[];
}
