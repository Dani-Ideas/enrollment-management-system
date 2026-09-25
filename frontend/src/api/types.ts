// export interface SesionCajaDTO {
//   id: number;
//   cajero: string;
//   cerrada: boolean;
//   fApertura: string | null;
//   fCierre: string | null;
//   locacion: string;
//   montoApertura: number;
//   montoCierre: number | null;
// }

//export type Rol = "ADMIN" | "VENDEDOR" | "CAJERO";


//*-*-*-*-**-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*-*--*-*-*-*--*-*-*-*-*-*-*-*-*-*-*-*-*
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
// objetos anidados.
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

// Forma de ENTRADA -- las relaciones viajan como id suelto, no como texto.
export interface InscripcionRequestDTO {
  estadoId: number;
  sistemaId: number;
  jefeCarreraId: number;
  maestroId: number;
  carreraId: number;
  ambienteId: number;
  proyecto: string;
  version: string;
  descripcion: string | null;
  fechaInscripcionPlanteada: string;
  fechaInscripcionReal: string | null;
}

// "Tablas genericas": los 4 catalogos de arriba (Estado/Sistema/Responsable/Ambiente) en
// un solo bundle -- espejo de TablasInscripcionDto.java del backend. Reemplaza los 4 GET
// separados (fetchEstados + fetchSistemas + fetchResponsables + fetchAmbientes) por uno.
export interface TablasInscripcionDTO {
  estados: EstadoDTO[];
  sistemas: SistemaDTO[];
  responsables: ResponsableDTO[];
  ambientes: AmbienteDTO[];
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

export interface FormacionComplementariaRequestDTO {
  inscripcionId: number;
  descripcion: string;
}