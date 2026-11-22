// Tipos y constantes compartidas entre FormularioPagoPage.tanstack.tsx e
// InscripcionWizard.tanstack.tsx (via useInscripcionForm) -- antes vivian
// duplicadas, una copia identica en cada archivo.

export type Accion = "lista" | "crear" | "actualizar" | "consultar"

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

// Corte a partir del cual la pagina se arma como ResizablePanelGroup: Resumen de la cadena
// (arrastrable/colapsable) + formulario. Por debajo es una sola columna angosta y el Resumen
// no se monta -- es el mismo 1024px que el breakpoint "lg" de Tailwind, pero aca hace falta
// como media query de verdad (useMediaQuery) porque cambia el ARBOL, no solo las clases.
export const CORTE_ESCRITORIO = "(min-width: 1024px)"

// El backend guarda LocalDateTime ("2026-03-01T10:00:00"); el input
// type="datetime-local" solo entiende hasta el minuto -- truncar alcanza (el
// backend acepta LocalDateTime sin segundos igual).
export function aInputDatetime(iso: string | null): string {
  return iso ? iso.slice(0, 16) : ""
}

// PASOS por rama -- sin paso de "elegir accion": la accion llega por la URL
// (?accion=..., la elige el submenu de HomePage), asi que el paso 0 ya es el primero
// real de cada rama. El Carousel SIEMPRE tiene 13 CarouselItem (el maximo, "actualizar"/
// "consultar" con su paso 0 de seleccion): mantener la CANTIDAD de slides fija evita que
// Embla tenga que re-detectar slides nuevos a mitad de sesion.
//
// "crear" es dos peticiones HTTP distintas: la solicitud de Primaria (pasos 0-1, POST
// /solicitudes) y, opcionalmente, el resto de la cadena (pasos 2-11) -- checklist/pruebas/
// documento/aviso de primaria -> solicitud de secundaria -> sus paneles -> solicitud de
// universidad -> sus paneles -- en varias peticiones secuenciales (ya no una sola "cadena",
// ver enviarCadena en useInscripcionForm) recien cuando el usuario elige "Finalizar y
// enviar" en CUALQUIER Confirmacion de la cadena (3/5/7/9/11) -- el front no valida la
// dependencia entre niveles, eso lo hace el back y responde 409 si no corresponde (nivel
// anterior sin su VoBo completo).
//
// "actualizar"/"consultar" comparten EXACTAMENTE los mismos pasos (recorren toda la
// cadena -- primaria/secundaria/universidad -- con un paso 0 extra para elegir la
// solicitud, ver cargarActualizacion/cargarConsulta en useInscripcionForm): lo unico que
// cambia es si los campos quedan editables con botones "Guardar cambios" (actualizar) o
// deshabilitados de solo lectura (consultar).
export function etiquetaPaso(accion: Accion | null, indice: number): string {
  if (accion === "lista") return indice === 0 ? "Lista de solicitudes" : ""
  if (accion === "crear") {
    return (
      {
        0: "Datos de la inscripción primaria",
        1: "Confirmación",
        2: "Checklist, pruebas y documentación (primaria)",
        3: "Confirmación",
        4: "Datos de la inscripción secundaria",
        5: "Confirmación",
        6: "Checklist, pruebas y documentación (secundaria)",
        7: "Confirmación",
        8: "Datos de la inscripción universidad",
        9: "Confirmación",
        10: "Checklist, pruebas y documentación (universidad)",
        11: "Confirmación",
      }[indice] ?? ""
    )
  }
  if (accion === "actualizar" || accion === "consultar") {
    return (
      {
        0: "Elegir solicitud",
        1: "Inscripción primaria",
        2: "Confirmación",
        3: "Checklist, pruebas y documentación (primaria)",
        4: "Confirmación",
        5: "Inscripción secundaria",
        6: "Confirmación",
        7: "Checklist, pruebas y documentación (secundaria)",
        8: "Confirmación",
        9: "Inscripción universidad",
        10: "Confirmación",
        11: "Checklist, pruebas y documentación (universidad)",
        12: "Confirmación",
      }[indice] ?? ""
    )
  }
  return ""
}

export function totalPasos(accion: Accion | null): number {
  if (accion === "lista") return 1
  if (accion === "actualizar") return 13
  if (accion === "crear") return 12
  if (accion === "consultar") return 13
  return 0
}

// Fila editable de checklist -- "id" null significa "todavia no existe en el backend".
// Reemplaza al viejo checklist fijo de firmas booleanas (FirmaItem/FIRMAS_DIPLOMA_*): ahora
// es una lista dinamica de actividades, cada una con su propio estado/responsable.
export interface ChecklistItemEditable {
  id: number | null
  estadoId: string
  responsableId: string
  seccion: string
  actividad: string
  descripcion: string
  conexion: string
  comentario: string
}

export const CHECKLIST_ITEM_VACIO: ChecklistItemEditable = {
  id: null,
  estadoId: "",
  responsableId: "",
  seccion: "",
  actividad: "",
  descripcion: "",
  conexion: "",
  comentario: "",
}

export interface PruebaItemEditable {
  id: number | null
  tipoPruebaId: string
  estadoId: string
  ruta: string
  alcance: string
  resultado: string
  comentario: string
}

export const PRUEBA_ITEM_VACIO: PruebaItemEditable = {
  id: null,
  tipoPruebaId: "",
  estadoId: "",
  ruta: "",
  alcance: "",
  resultado: "",
  comentario: "",
}

// Documento y aviso de versiones son 1:1 con la solicitud -- un solo objeto, no una lista.
export interface DocumentoEditable {
  completo: boolean
  comentario: string
}

export const DOCUMENTO_VACIO: DocumentoEditable = { completo: false, comentario: "" }

export interface AvisoVersionEditable {
  reporte: string
}

export const AVISO_VERSION_VACIO: AvisoVersionEditable = { reporte: "" }
