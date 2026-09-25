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

// PASOS por rama -- el paso 0 ("Elegir accion") es comun a las tres. El
// Carousel de ambos wizards SIEMPRE tiene 5 CarouselItem (el maximo que
// necesita la rama mas larga, "crear"): mantener la CANTIDAD de slides fija
// de entrada a salida evita que Embla tenga que re-detectar slides nuevos a
// mitad de sesion. La rama "lista" solo existe en InscripcionWizard
// (FormularioPagoPage nunca dispara accion === "lista").
export function etiquetaPaso(accion: Accion | null, indice: number): string {
  if (indice === 0) return "Elegir acción"
  if (accion === "lista") return indice === 1 ? "Lista de solicitudes" : ""
  if (accion === "actualizar") {
    return { 1: "Elegir solicitud", 2: "Editar campos", 3: "Confirmación" }[indice] ?? ""
  }
  if (accion === "crear") {
    return (
      { 1: "Catálogo", 2: "Responsables", 3: "Datos del proyecto", 4: "Confirmación" }[indice] ?? ""
    )
  }
  return ""
}

export function totalPasos(accion: Accion | null): number {
  if (accion === "lista") return 2
  if (accion === "actualizar") return 4
  if (accion === "crear") return 5
  return 1
}
