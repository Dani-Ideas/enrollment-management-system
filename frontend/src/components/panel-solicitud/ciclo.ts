export type TonoCiclo = "aprobado" | "revision" | "borrador" | "conflicto"

// Un token por tono (ver index.css): el fondo y el borde salen del MISMO color con
// opacidad, asi que no hay 3 clases por estado que se puedan desincronizar, y el modo
// oscuro ya viene resuelto desde la variable.
export const CLASES_CICLO: Record<TonoCiclo, string> = {
  aprobado: "text-ciclo-aprobado bg-ciclo-aprobado/10 border-ciclo-aprobado/25",
  revision: "text-ciclo-revision bg-ciclo-revision/10 border-ciclo-revision/25",
  borrador: "text-ciclo-borrador bg-ciclo-borrador/10 border-ciclo-borrador/25",
  conflicto: "text-ciclo-conflicto bg-ciclo-conflicto/10 border-ciclo-conflicto/25",
}

// El estado de una solicitud es texto libre del catalogo (MINIFORMEST), no un enum: no se
// puede mapear por id (los ids cambian de base en base) ni asumir una lista cerrada. Esto
// es una heuristica sobre el texto y cae en "borrador" cuando no reconoce nada.
export function tonoDeEstado(estado: string | null | undefined): TonoCiclo {
  const texto = (estado ?? "").toLowerCase()
  if (/aprob|complet|listo|finaliz|cerrad/.test(texto)) return "aprobado"
  if (/revis|proceso|curso|tramite|trámite|pendiente/.test(texto)) return "revision"
  if (/rechaz|error|conflict|cancel|baja/.test(texto)) return "conflicto"
  return "borrador"
}
