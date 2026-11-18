// Tipos y constantes compartidas entre FormularioPagoPage.tanstack.tsx e
// InscripcionWizard.tanstack.tsx (via useInscripcionForm) -- antes vivian
// duplicadas, una copia identica en cada archivo.

export type Accion = "lista" | "crear" | "actualizar"

// Fila de "formacion complementaria" en edicion -- id null significa "todavia no existe
// en el backend" (tanto una fila recien agregada en el flujo "actualizar" como
// cualquier fila del flujo "crear", donde la Inscripcion en si tampoco existe todavia).
export interface FormacionComplementariaEditable {
  id: number | null
  descripcion: string
}

// Campos del formulario en su forma "de UI": todo string (lo que dan los
// <input>/<select> nativos) -- se convierten a numero/InscripcionRequestDTO
// recien al mandar la peticion (ver camposADto en useInscripcionForm). Un
// solo tipo para crear Y editar porque son los mismos 11 campos del mismo
// InscripcionRequestDTO.
export interface CamposFormulario {
  estadoId: string
  sistemaId: string
  jefeCarreraId: string
  maestroId: string
  carreraId: string
  ambienteId: string
  proyecto: string
  version: string
  descripcion: string
  fechaPlanteada: string
  fechaReal: string
}

export const CAMPOS_VACIOS: CamposFormulario = {
  estadoId: "",
  sistemaId: "",
  jefeCarreraId: "",
  maestroId: "",
  carreraId: "",
  ambienteId: "",
  proyecto: "",
  version: "",
  descripcion: "",
  fechaPlanteada: "",
  fechaReal: "",
}

// El backend guarda LocalDateTime ("2026-03-01T10:00:00"); el input
// type="datetime-local" solo entiende hasta el minuto -- truncar alcanza (el
// backend acepta LocalDateTime sin segundos igual).
export function aInputDatetime(iso: string | null): string {
  return iso ? iso.slice(0, 16) : ""
}

// PASOS por rama -- sin paso de "elegir accion": la accion llega por la URL
// (?accion=..., la elige el submenu de HomePage), asi que el paso 0 ya es el primero
// real de cada rama. El Carousel SIEMPRE tiene 12 CarouselItem (el maximo, "crear" con la
// cadena completa): mantener la CANTIDAD de slides fija evita que Embla tenga que
// re-detectar slides nuevos a mitad de sesion.
//
// "crear" es dos peticiones HTTP distintas: la Inscripcion de Primaria (pasos 0-1, POST
// /inscripciones, ya existia) y, opcionalmente, el resto de la cadena (pasos 2-11) --
// Diploma Primaria -> Inscripcion Secundaria -> Diploma Secundaria -> Inscripcion
// Universidad -> Diploma Universidad, en UNA sola peticion (POST /inscripciones/{id}/
// cadena-diplomas) recien cuando el usuario elige "Finalizar y enviar" en CUALQUIER
// Confirmacion de la cadena (3/5/7/9/11) -- el front no valida la dependencia entre
// niveles, eso lo hace el back y responde 409 si no corresponde.
//
// "actualizar" en cambio NO tiene Confirmaciones intermedias (pasos 2-6 son navegacion
// local libre) y su cadena se manda entera recien en la Confirmacion final (paso 7, PUT
// /inscripciones/{id}/cadena-diplomas -- upsert, ver construirCadenaDtoActualizar).
export function etiquetaPaso(accion: Accion | null, indice: number): string {
  if (accion === "lista") return indice === 0 ? "Lista de solicitudes" : ""
  if (accion === "actualizar") {
    return (
      {
        0: "Elegir solicitud",
        1: "Datos de la inscripción primaria",
        2: "Datos del diploma primaria",
        3: "Datos de la inscripción secundaria",
        4: "Datos del diploma secundaria",
        5: "Datos de la inscripción universidad",
        6: "Datos del diploma universidad",
        7: "Confirmación",
      }[indice] ?? ""
    )
  }
  if (accion === "crear") {
    return (
      {
        0: "Datos de la inscripción primaria",
        1: "Confirmación",
        2: "Datos del diploma primaria",
        3: "Confirmación",
        4: "Datos de la inscripción secundaria",
        5: "Confirmación",
        6: "Datos del diploma secundaria",
        7: "Confirmación",
        8: "Datos de la inscripción universidad",
        9: "Confirmación",
        10: "Datos del diploma universidad",
        11: "Confirmación",
      }[indice] ?? ""
    )
  }
  return ""
}

export function totalPasos(accion: Accion | null): number {
  if (accion === "lista") return 1
  if (accion === "actualizar") return 8
  if (accion === "crear") return 12
  return 0
}

// Un item del checklist de firmas de un diploma -- "campo" es la clave real del DTO
// (firmaMaestro1ro, firmaDirectorPrimaria, ...), "etiqueta" es el texto que ve el usuario.
// Vive aca (no en CampoFirmas.tsx) porque useInscripcionForm tambien lo necesita para armar
// el resumen de la cadena (ResumenCadena) -- un tipo/constante compartida entre el hook y
// el componente de UI, igual motivo que CamposFormulario/CAMPOS_VACIOS de arriba.
export interface FirmaItem {
  campo: string
  etiqueta: string
}

export const FIRMAS_DIPLOMA_PRIMARIA: FirmaItem[] = [
  { campo: "firmaMaestro1ro", etiqueta: "Maestro de 1er grado" },
  { campo: "firmaMaestro2do", etiqueta: "Maestro de 2do grado" },
  { campo: "firmaMaestro3ro", etiqueta: "Maestro de 3er grado" },
  { campo: "firmaMaestro4to", etiqueta: "Maestro de 4to grado" },
  { campo: "firmaMaestro5to", etiqueta: "Maestro de 5to grado" },
  { campo: "firmaMaestro6to", etiqueta: "Maestro de 6to grado" },
  { campo: "firmaDirectorPrimaria", etiqueta: "Director de primaria" },
]

export const FIRMAS_DIPLOMA_SECUNDARIA: FirmaItem[] = [
  { campo: "firmaMaestroPrimerGrado", etiqueta: "Maestro de 1er grado" },
  { campo: "firmaMaestroSegundoGrado", etiqueta: "Maestro de 2do grado" },
  { campo: "firmaMaestroTercerGrado", etiqueta: "Maestro de 3er grado" },
  { campo: "firmaOrientador", etiqueta: "Orientador" },
  { campo: "firmaDirectorSecundaria", etiqueta: "Director de secundaria" },
]

export const FIRMAS_DIPLOMA_UNIVERSIDAD: FirmaItem[] = [
  { campo: "firmaDecanoFacultad", etiqueta: "Decano de la facultad" },
  { campo: "firmaCoordinadorCarrera", etiqueta: "Coordinador de carrera" },
  { campo: "firmaSecretarioAcademico", etiqueta: "Secretario académico" },
  { campo: "firmaRector", etiqueta: "Rector" },
]
