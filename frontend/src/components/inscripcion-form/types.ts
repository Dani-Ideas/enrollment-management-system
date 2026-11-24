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

// Medidas del layout de escritorio que NO pueden ser un token CSS: react-resizable-panels
// las recibe por prop (defaultSize/minSize/maxSize/collapsedSize), no por clase, y no
// acepta var(). Centralizadas aca igual, al lado del corte, para que el JSX no vuelva a
// tener numeros sueltos. Las que SI son clases (alturas del wizard, anchos del marco de
// pagina, tipografia) son tokens en index.css.
export const PANEL_RESUMEN = {
  defecto: "280px",
  minimo: "220px",
  maximo: "420px",
  // collapsedSize 0 = el panel desaparece del todo; de esto depende la lectura
  // "0 pixeles ES colapsado" del onResize (ver FormularioInscripciones).
  colapsado: "0px",
} as const

// Alto del panel del encabezado dentro del grupo vertical (no se arrastra).
export const ALTO_ENCABEZADO_ESCRITORIO = "96px"

// El backend guarda LocalDateTime ("2026-03-01T10:00:00"); el input
// type="datetime-local" solo entiende hasta el minuto -- truncar alcanza (el
// backend acepta LocalDateTime sin segundos igual).
export function aInputDatetime(iso: string | null): string {
  return iso ? iso.slice(0, 16) : ""
}

// PASOS por rama -- sin paso de "elegir accion": la accion llega por la URL
// (?accion=..., la elige el submenu de HomePage), asi que el paso 0 ya es el primero
// real de cada rama.
//
// Los pasos NO dependen solo de la accion: dependen tambien del AMBIENTE de la inscripcion.
// Los pasos de checklist/pruebas/documentacion existen unicamente en el ambiente principal
// (el de id mas chico del catalogo, ver llevaPaneles en useInscripcionForm); en
// cualquier otro ambiente la inscripcion es solo sus datos, y esos pasos -- con sus
// peticiones HTTP -- no existen: "crear" pasa de 8 pasos a 5 y "actualizar"/"consultar" de
// 7 a 4. Por eso un paso se identifica por su ID (PasoCadena) y nunca por su numero: el
// indice del mismo paso logico cambia segun el ambiente.
//
// NO hay un paso de Confirmacion por nivel. Antes cada nivel tenia dos (uno repitiendo los
// campos que se acababan de llenar y otro con el VoBo), 13 pasos en total: no aportaban nada
// -- los campos estan en el paso de arriba, el Resumen lateral ya muestra lo guardado, y
// crear una inscripcion son 2 peticiones HTTP (la Primaria y sus formaciones) y actualizarla
// una sola; no hay nada "pesado" que avisar antes de mandar (clonar desde otra solicitud
// suma un GET, pero eso lo pide el usuario explicitamente). Quedan solo dos Confirmaciones
// en "crear": "confirmar-creacion", que precede al POST de la Primaria, y "confirmar-cadena",
// que muestra el resultado de "Finalizar y enviar". El VoBo que devuelve el servidor y los
// botones de la cadena viven al pie del paso de cada nivel.
//
// "crear": la solicitud de Primaria se crea en "confirmar-creacion" (POST /solicitudes, con
// sus formaciones) y el resto de la cadena es opcional -- paneles de primaria -> solicitud
// de secundaria -> sus paneles -> solicitud de universidad -> sus paneles -- en varias
// peticiones secuenciales (ver enviarSecuenciaCadena en useInscripcionForm) recien cuando el
// usuario elige "Finalizar y enviar" en CUALQUIERA de esos pasos -- el front no valida la
// dependencia entre niveles, eso lo hace el back y responde 409 si no corresponde (nivel
// anterior sin su VoBo completo).
//
// "actualizar"/"consultar" comparten EXACTAMENTE los mismos pasos (recorren toda la
// cadena -- primaria/secundaria/universidad -- con un paso extra al principio para elegir la
// solicitud, ver cargarActualizacion/cargarConsulta en useInscripcionForm): lo unico que
// cambia es si los campos quedan editables con botones "Guardar cambios" (actualizar) o
// deshabilitados de solo lectura (consultar). No tienen "confirmar-cadena": terminan en el
// ultimo paso del nivel universidad, donde esta el boton para elegir otra solicitud.
export type PasoCadena =
  | "lista"
  | "elegir-solicitud"
  | "datos-primaria"
  | "confirmar-creacion"
  | "paneles-primaria"
  | "datos-secundaria"
  | "paneles-secundaria"
  | "datos-universidad"
  | "paneles-universidad"
  | "confirmar-cadena"

// La lista de pasos de un flujo, EN ORDEN -- unica fuente de verdad de cuantos pasos hay y
// en que posicion cae cada uno. El indice de un paso es su posicion aca (ver pasoDe/trasPaso
// en useInscripcionForm), y el Carousel monta exactamente estos slides, en este orden.
export function pasosDe(accion: Accion | null, conPaneles: boolean): PasoCadena[] {
  if (accion === null) return []
  if (accion === "lista") return ["lista"]
  if (accion === "crear") {
    return conPaneles
      ? [
          "datos-primaria",
          "confirmar-creacion",
          "paneles-primaria",
          "datos-secundaria",
          "paneles-secundaria",
          "datos-universidad",
          "paneles-universidad",
          "confirmar-cadena",
        ]
      : ["datos-primaria", "confirmar-creacion", "datos-secundaria", "datos-universidad", "confirmar-cadena"]
  }
  return conPaneles
    ? [
        "elegir-solicitud",
        "datos-primaria",
        "paneles-primaria",
        "datos-secundaria",
        "paneles-secundaria",
        "datos-universidad",
        "paneles-universidad",
      ]
    : ["elegir-solicitud", "datos-primaria", "datos-secundaria", "datos-universidad"]
}

// El MISMO paso logico se llama distinto segun la rama: en "crear" se esta llenando algo
// nuevo ("Datos de la inscripcion primaria") y en "actualizar"/"consultar" se esta mirando
// algo que ya existe ("Inscripcion primaria").
const ETIQUETAS: Record<"crear" | "actualizar", Partial<Record<PasoCadena, string>>> = {
  crear: {
    "datos-primaria": "Datos de la inscripción primaria",
    "confirmar-creacion": "Confirmación",
    "paneles-primaria": "Checklist, pruebas y documentación (primaria)",
    "datos-secundaria": "Datos de la inscripción secundaria",
    "paneles-secundaria": "Checklist, pruebas y documentación (secundaria)",
    "datos-universidad": "Datos de la inscripción universidad",
    "paneles-universidad": "Checklist, pruebas y documentación (universidad)",
    "confirmar-cadena": "Confirmación",
  },
  actualizar: {
    "elegir-solicitud": "Elegir solicitud",
    "datos-primaria": "Inscripción primaria",
    "paneles-primaria": "Checklist, pruebas y documentación (primaria)",
    "datos-secundaria": "Inscripción secundaria",
    "paneles-secundaria": "Checklist, pruebas y documentación (secundaria)",
    "datos-universidad": "Inscripción universidad",
    "paneles-universidad": "Checklist, pruebas y documentación (universidad)",
  },
}

export function etiquetaPaso(accion: Accion | null, indice: number, conPaneles: boolean): string {
  if (accion === null) return ""
  if (accion === "lista") return indice === 0 ? "Lista de solicitudes" : ""
  const paso = pasosDe(accion, conPaneles)[indice]
  if (paso === undefined) return ""
  return ETIQUETAS[accion === "crear" ? "crear" : "actualizar"][paso] ?? ""
}

export function totalPasos(accion: Accion | null, conPaneles: boolean): number {
  return pasosDe(accion, conPaneles).length
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
