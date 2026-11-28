
import type { ChecklistTemplateDTO, ChecklistTemplateFilaDTO } from "@/api/types"

export type Accion = "lista" | "crear" | "actualizar" | "consultar"

export interface FormacionComplementariaEditable {
  id: number | null
  descripcion: string
}

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

// ◽ RESUMEN
export const CORTE_ESCRITORIO = "(min-width: 1024px)"

// ◽ RESUMEN
export const PANEL_RESUMEN = {
  defecto: "280px",
  minimo: "220px",
  maximo: "420px",
  colapsado: "0px",
} as const

// ◽ RESUMEN
export const ALTO_ENCABEZADO_ESCRITORIO = "96px"

export function aInputDatetime(iso: string | null): string {
  return iso ? iso.slice(0, 16) : ""
}

// 📌 PASOS DINAMICOS -- NUCLEO: cuantos pasos hay, cuales y como se llaman, segun accion y ambiente.
// 📌 PASOS DINAMICOS: el id de cada paso -- nunca su numero.
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

// 📌 PASOS DINAMICOS: la lista de pasos del flujo actual. "conPaneles" es el ambiente.
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

// 📌 PASOS DINAMICOS: la etiqueta de cada paso, por accion.
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

// 📌 PASOS DINAMICOS
export function etiquetaPaso(accion: Accion | null, indice: number, conPaneles: boolean): string {
  if (accion === null) return ""
  if (accion === "lista") return indice === 0 ? "Lista de solicitudes" : ""
  const paso = pasosDe(accion, conPaneles)[indice]
  if (paso === undefined) return ""
  return ETIQUETAS[accion === "crear" ? "crear" : "actualizar"][paso] ?? ""
}

// 📌 PASOS DINAMICOS
export function totalPasos(accion: Accion | null, conPaneles: boolean): number {
  return pasosDe(accion, conPaneles).length
}

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

// Lo que ChecklistEditor necesita para ofrecer plantillas. Es UNO para toda la pantalla
// (no uno por nivel): "guardar" recibe las filas del nivel que lo llama, asi que el mismo
// objeto sirve para primaria, secundaria y universidad.
export type PlantillasChecklistApi = {
  query: { data: ChecklistTemplateDTO[] | undefined; isLoading: boolean }
  guardar: (nombre: string, items: ChecklistItemEditable[]) => void
  guardando: boolean
  error: string | null
  guardada: string | null
}

// Plantilla -> filas editables. La plantilla solo trae los 4 textos, asi que el resto
// (estado, responsable, comentario) arranca vacio igual que una fila nueva: id null, o sea
// que al guardar salen como POST, no como PUT.
export function checklistDesdePlantilla(filas: ChecklistTemplateFilaDTO[]): ChecklistItemEditable[] {
  return filas.map((fila) => ({
    ...CHECKLIST_ITEM_VACIO,
    seccion: fila.seccion,
    actividad: fila.actividad,
    descripcion: fila.descripcion,
    conexion: fila.conexion,
  }))
}

// Filas editables -> plantilla. Descarta las filas en blanco con el MISMO criterio que
// guardarPanelesNivel() (seccion y actividad vacias), para que lo que se guarda como
// plantilla sea exactamente lo que se guardaria como checklist.
export function plantillaDesdeChecklist(items: ChecklistItemEditable[]): ChecklistTemplateFilaDTO[] {
  return items
    .filter((item) => item.seccion.trim() !== "" || item.actividad.trim() !== "")
    .map((item) => ({
      seccion: item.seccion,
      actividad: item.actividad,
      descripcion: item.descripcion,
      conexion: item.conexion,
    }))
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

export interface DocumentoEditable {
  completo: boolean
  comentario: string
}

export const DOCUMENTO_VACIO: DocumentoEditable = { completo: false, comentario: "" }

export interface AvisoVersionEditable {
  reporte: string
}

export const AVISO_VERSION_VACIO: AvisoVersionEditable = { reporte: "" }
