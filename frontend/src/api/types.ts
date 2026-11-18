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
// diplomaPrimariaId: null si esta Inscripcion todavia no tiene diploma de primaria --
// cuando viene, ES el id de linaje compartido por el resto de la cadena (ver nota en
// DiplomaPrimariaDTO mas abajo), asi que "actualizar" lo usa para saber si ya hay una
// cadena Secundaria/Universidad que traer.
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
  diplomaPrimariaId: number | null;
}

// Forma de ENTRADA -- las relaciones viajan como id suelto, no como texto.
// Mismo nombre de campo que la entidad del lado del back (estado/sistema/...,
// no estadoId/sistemaId/...) -- asi quedo el record InscripcionRequestDto.java.
export interface InscripcionRequestDTO {
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

// Forma de ENTRADA -- espejo de FormacionComplementariaRequestDto.java. "id" identifica
// cual fila editar dentro de la lista compuesta (null = es nueva, se crea). La inscripcion
// duena la decide el backend (URL del PUT o la recien creada en el POST).
export interface FormacionComplementariaRequestDTO {
  id: number | null;
  descripcion: string;
}

// Forma de ENTRADA de POST/PUT /inscripciones -- espejo de
// InscripcionConFormacionComplementariaRequestDto.java. Una sola peticion para la
// Inscripcion y TODA la lista de formaciones complementarias -- en el PUT, es la lista
// COMPLETA que debe quedar (una fila con id = editarla, sin id = crearla; la que falte en
// la lista se borra del lado del backend).
export interface InscripcionConFormacionComplementariaRequestDTO {
  inscripcion: InscripcionRequestDTO;
  formacionesComplementarias: FormacionComplementariaRequestDTO[];
}

// Forma de SALIDA de POST/PUT /inscripciones -- espejo de
// InscripcionConFormacionComplementariaDto.java.
export interface InscripcionConFormacionComplementariaDTO {
  inscripcion: InscripcionDTO;
  formacionesComplementarias: FormacionComplementariaDTO[];
}

// --- Cadena Primaria/Secundaria/Universidad -- espejo de los DTO nuevos del backend ---
//
// InscripcionDTO/InscripcionRequestDTO (arriba) son ahora, en los hechos, "Primaria": la
// tabla INSCRIPCION no se renombro. DiplomaPrimariaDTO es standalone (su propio
// GET/POST/PUT), sin wrapper compuesto, porque InscripcionEty no se tocó.
//
// "id" en Diploma*DTO (Secundaria/Universidad) es SIEMPRE el mismo numero que
// DiplomaPrimariaDTO.id -- toda la cadena comparte un unico id de linaje (PK compartida en
// el backend), por eso aca no hay inscripcionXId/diplomaXId por separado.

// Espejo de DiplomaPrimariaDto.java.
export interface DiplomaPrimariaDTO {
  id: number;
  inscripcionId: number;
  firmaMaestro1ro: boolean;
  firmaMaestro2do: boolean;
  firmaMaestro3ro: boolean;
  firmaMaestro4to: boolean;
  firmaMaestro5to: boolean;
  firmaMaestro6to: boolean;
  firmaDirectorPrimaria: boolean;
  emitido: boolean;
  fechaEmision: string | null;
}

// Espejo de DiplomaPrimariaRequestDto.java -- sin emitido/fechaEmision: los calcula el
// backend, nunca se mandan.
export interface DiplomaPrimariaRequestDTO {
  inscripcion: number;
  firmaMaestro1ro: boolean;
  firmaMaestro2do: boolean;
  firmaMaestro3ro: boolean;
  firmaMaestro4to: boolean;
  firmaMaestro5to: boolean;
  firmaMaestro6to: boolean;
  firmaDirectorPrimaria: boolean;
}

// Espejo de InscripcionSecundariaDto.java -- mismo aplanado que InscripcionDTO.
export interface InscripcionSecundariaDTO {
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

// Espejo de InscripcionSecundariaRequestDto.java -- "diplomaPrimaria" fija la PK compartida
// de la fila nueva; es inmutable despues de crear (el backend lo ignora en el PUT).
export interface InscripcionSecundariaRequestDTO {
  diplomaPrimaria: number;
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

// Espejo de DiplomaSecundariaDto.java -- sin FK propia (ver nota de arriba sobre "id").
export interface DiplomaSecundariaDTO {
  id: number;
  firmaMaestroPrimerGrado: boolean;
  firmaMaestroSegundoGrado: boolean;
  firmaMaestroTercerGrado: boolean;
  firmaOrientador: boolean;
  firmaDirectorSecundaria: boolean;
  emitido: boolean;
  fechaEmision: string | null;
}

// Espejo de DiplomaSecundariaRequestDto.java -- solo el checklist de firmas; la cadena hacia
// primaria la fija InscripcionSecundariaRequestDTO.diplomaPrimaria.
export interface DiplomaSecundariaRequestDTO {
  firmaMaestroPrimerGrado: boolean;
  firmaMaestroSegundoGrado: boolean;
  firmaMaestroTercerGrado: boolean;
  firmaOrientador: boolean;
  firmaDirectorSecundaria: boolean;
}

// Espejo de InscripcionSecundariaConDiplomaDto.java -- a diferencia de
// InscripcionConFormacionComplementariaDTO, el diploma NUNCA es una lista ni es opcional.
export interface InscripcionSecundariaConDiplomaDTO {
  inscripcionSecundaria: InscripcionSecundariaDTO;
  diplomaSecundaria: DiplomaSecundariaDTO;
}

// Espejo de InscripcionSecundariaConDiplomaRequestDto.java -- diplomaSecundaria es
// obligatorio en POST y PUT (siempre trae el checklist de firmas).
export interface InscripcionSecundariaConDiplomaRequestDTO {
  inscripcionSecundaria: InscripcionSecundariaRequestDTO;
  diplomaSecundaria: DiplomaSecundariaRequestDTO;
}

// Espejo de InscripcionUniversidadDto.java.
export interface InscripcionUniversidadDTO {
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

// Espejo de InscripcionUniversidadRequestDto.java -- "diplomaSecundaria" fija la PK
// compartida, inmutable despues de crear.
export interface InscripcionUniversidadRequestDTO {
  diplomaSecundaria: number;
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

// Espejo de DiplomaUniversidadDto.java.
export interface DiplomaUniversidadDTO {
  id: number;
  firmaDecanoFacultad: boolean;
  firmaCoordinadorCarrera: boolean;
  firmaSecretarioAcademico: boolean;
  firmaRector: boolean;
  emitido: boolean;
  fechaEmision: string | null;
}

// Espejo de DiplomaUniversidadRequestDto.java -- solo el checklist de firmas; la cadena
// hacia secundaria la fija InscripcionUniversidadRequestDTO.diplomaSecundaria.
export interface DiplomaUniversidadRequestDTO {
  firmaDecanoFacultad: boolean;
  firmaCoordinadorCarrera: boolean;
  firmaSecretarioAcademico: boolean;
  firmaRector: boolean;
}

// Espejo de InscripcionUniversidadConDiplomaDto.java.
export interface InscripcionUniversidadConDiplomaDTO {
  inscripcionUniversidad: InscripcionUniversidadDTO;
  diplomaUniversidad: DiplomaUniversidadDTO;
}

// Espejo de InscripcionUniversidadConDiplomaRequestDto.java.
export interface InscripcionUniversidadConDiplomaRequestDTO {
  inscripcionUniversidad: InscripcionUniversidadRequestDTO;
  diplomaUniversidad: DiplomaUniversidadRequestDTO;
}

// --- POST /inscripciones/{id}/cadena-diplomas -- continua la cadena en UNA sola peticion a
// partir de una Inscripcion (Primaria) que ya existe. Espejo de los DTO *DatosDto.java del
// backend: cada nivel es opcional (undefined = el usuario no llego hasta ahi en el
// wizard), pero son ACUMULATIVOS en orden -- el backend rechaza con 409 si falta un nivel
// intermedio.

// Espejo de DiplomaPrimariaDatosDto.java -- igual que DiplomaPrimariaRequestDTO sin
// "inscripcion" (fijo por la URL).
export interface DiplomaPrimariaDatosDTO {
  firmaMaestro1ro: boolean;
  firmaMaestro2do: boolean;
  firmaMaestro3ro: boolean;
  firmaMaestro4to: boolean;
  firmaMaestro5to: boolean;
  firmaMaestro6to: boolean;
  firmaDirectorPrimaria: boolean;
}

// Espejo de InscripcionSecundariaDatosDto.java -- igual que InscripcionSecundariaRequestDTO
// sin "diplomaPrimaria" (el encadenamiento es implicito: el nivel anterior en la MISMA
// peticion).
export interface InscripcionSecundariaDatosDTO {
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

// Espejo de InscripcionUniversidadDatosDto.java.
export interface InscripcionUniversidadDatosDTO {
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

// Espejo de CadenaDiplomasRequestDto.java.
export interface CadenaDiplomasRequestDTO {
  diplomaPrimaria?: DiplomaPrimariaDatosDTO;
  inscripcionSecundaria?: InscripcionSecundariaDatosDTO;
  diplomaSecundaria?: DiplomaSecundariaRequestDTO;
  inscripcionUniversidad?: InscripcionUniversidadDatosDTO;
  diplomaUniversidad?: DiplomaUniversidadRequestDTO;
}

// Espejo de CadenaDiplomasDto.java -- cada campo es null si ese nivel no vino en la
// peticion (el usuario no siguio hasta ahi).
export interface CadenaDiplomasDTO {
  diplomaPrimaria: DiplomaPrimariaDTO | null;
  inscripcionSecundaria: InscripcionSecundariaDTO | null;
  diplomaSecundaria: DiplomaSecundariaDTO | null;
  inscripcionUniversidad: InscripcionUniversidadDTO | null;
  diplomaUniversidad: DiplomaUniversidadDTO | null;
}
