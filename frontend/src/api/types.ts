
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

export interface TablasInscripcionDTO {
  estados: EstadoDTO[];
  sistemas: SistemaDTO[];
  responsables: ResponsableDTO[];
  ambientes: AmbienteDTO[];
  etapas: EtapaInscripcionDTO[];
  tiposPrueba: TipoPruebaDTO[];
  tiposArquitectura: TipoArquitecturaDTO[];
}

// Catalogo CAT_TIPO_ARQUITECTURA: por aca se agrupan las plantillas de checklist.
export interface TipoArquitecturaDTO {
  id: number;
  nombre: string;
}

export interface FormacionComplementariaDTO {
  id: number;
  inscripcionId: number;
  descripcion: string;
}

export interface FormacionComplementariaRequestDTO {
  id: number | null;
  descripcion: string;
}


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

export interface SolicitudConFormacionesDTO {
  solicitud: SolicitudDTO;
  formacionesComplementarias: FormacionComplementariaDTO[];
}

export interface SolicitudConFormacionesRequestDTO {
  solicitud: SolicitudRequestDTO;
  formacionesComplementarias?: FormacionComplementariaRequestDTO[];
}

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

export interface ChecklistItemRequestDTO {
  estado: number;
  responsable: number;
  seccion: string;
  actividad: string;
  descripcion: string;
  conexion: string;
  comentario: string | null;
}

// Plantilla de checklist (SOL_N_INSCRIPCION_CHECKLIST_TEMPLATE): preset global, no cuelga
// de ninguna solicitud. Se identifica por NOMBRE + TIPO DE ARQUITECTURA (es la PK real de
// la tabla, junto con el orden de cada fila), y cada fila dice a que ETAPA de la cadena
// aplica. Estado y responsable NO vienen de la plantilla: son ids de catalogo y cambian de
// base en base, asi que los sigue eligiendo el usuario.
export interface ChecklistTemplateFilaDTO {
  etapa: string;
  // 1/2/3 (Primaria/Secundaria/Universidad). Es por lo que el front filtra las filas que
  // le tocan a cada nivel -- el orden es estable entre bases, el id no.
  etapaOrden: number;
  seccion: string;
  actividad: string;
  descripcion: string;
  conexion: string;
  comentario: string | null;
}

export interface ChecklistTemplateDTO {
  nombre: string;
  tipoArquitecturaId: number;
  tipoArquitectura: string;
  filas: ChecklistTemplateFilaDTO[];
}

export interface ChecklistTemplateFilaRequestDTO {
  etapa: number;
  seccion: string;
  actividad: string;
  descripcion: string;
  conexion: string;
  comentario: string | null;
}

export interface ChecklistTemplateRequestDTO {
  nombre: string;
  tipoArquitectura: number;
  filas: ChecklistTemplateFilaRequestDTO[];
}

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

export interface PruebaRequestDTO {
  tipoPrueba: number;
  estado: number;
  ruta: string;
  alcance: string;
  resultado: string;
  comentario: string;
}

export interface DocumentoDTO {
  id: number;
  solicitudId: number;
  completo: boolean;
  comentario: string;
}

export interface DocumentoRequestDTO {
  completo: boolean;
  comentario: string;
}

export interface AvisoVersionDTO {
  id: number;
  solicitudId: number;
  reporte: string;
}

export interface AvisoVersionRequestDTO {
  reporte: string;
}

export interface VoBoDTO {
  solicitudId: number;
  pruebas: boolean;
  checklist: boolean;
  documentacion: boolean;
}

export interface SolicitudConPanelesDTO {
  solicitud: SolicitudDTO;
  checklist: ChecklistItemDTO[];
  pruebas: PruebaDTO[];
  documento: DocumentoDTO | null;
  avisoVersiones: AvisoVersionDTO | null;
  voBo: VoBoDTO | null;
  formacionesComplementarias: FormacionComplementariaDTO[];
}
