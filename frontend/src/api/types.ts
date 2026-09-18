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
// Dominio "solicitud/implantacion" -- unico dominio de negocio del frontend
// (el dominio academico de estudiantes/materias/clases/matriculas se retiro
// del front, ver bitacora). Se llama "Implantacion" (no "Solicitud") para no
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
export interface ImplantacionDTO {
  id: number;
  estado: string;
  sistema: string;
  responsableProyecto: string;
  responsableDesarrollo: string;
  responsableImplantacion: string;
  ambiente: string;
  proyecto: string;
  version: string;
  descripcion: string | null;
  fechaImplantacionPlanteada: string;
  fechaImplantacionReal: string | null;
}

// Forma de ENTRADA -- las relaciones viajan como id suelto, no como texto.
export interface ImplantacionRequestDTO {
  estadoId: number;
  sistemaId: number;
  responsableProyectoId: number;
  responsableDesarrolloId: number;
  responsableImplantacionId: number;
  ambienteId: number;
  proyecto: string;
  version: string;
  descripcion: string | null;
  fechaImplantacionPlanteada: string;
  fechaImplantacionReal: string | null;
}