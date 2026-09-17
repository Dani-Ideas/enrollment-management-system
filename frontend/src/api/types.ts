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

export interface EstudianteRequestDTO {
  username: string;
  password: string;
  carreraId: number;
}

export interface EstudianteDTO {
  id: number;
  username: string;
  carreraId: number;
  carreraNombre: string;
}

export interface ClaseRequestDTO {
  materiaId: number;
  profesorId: number;
}

export interface CarreraDTO {
  id: number;
  nombre: string;
}

export interface MateriaDTO {
  id: number;
  nombre: string;
  anio: number;
  carreraId:number;
  carreraNombre:string; 
}

export interface ProfesorDTO {
  id: number;
  nombre: string;
  carreraId:number;
  carreraNombre:string; 
  habilitaciones:MateriaDTO[];
}

export interface ClaseDTO {
  id: number;
  materia: MateriaDTO;
  profesor: ProfesorDTO;
  cuposDisponibles:number;
}

//MatriculaDto (+ sus *RequestDto)