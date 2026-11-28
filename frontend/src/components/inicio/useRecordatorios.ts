import { useQuery } from "@tanstack/react-query"
import { fetchSolicitudes } from "@/api/client"
import type { SolicitudDTO } from "@/api/types"
import type { TonoCiclo } from "@/components/panel-solicitud/ciclo"

export type EstadoPlazo = "vencido" | "esta-semana" | "proximo" | "completo" | "sin-fecha"

export interface Recordatorio {
  id: number
  proyecto: string
  version: string
  ambiente: string
  sistema: string
  niveles: SolicitudDTO[]
  // Inicio = la fecha planteada de la Primaria. Fin = la del último nivel de la cadena.
  // No hay una columna "fecha de fin": la cadena termina donde termina su último eslabón.
  inicio: string | null
  fin: string | null
  diasParaFin: number | null
  hechos: number
  estadoPlazo: EstadoPlazo
  tono: TonoCiclo
}

const DIA_MS = 24 * 60 * 60 * 1000

// Compara por DÍA, no por instante: una fecha de hoy a las 09:00 no está "vencida" a las
// 15:00. Las fechas llegan como "2026-11-19T09:54:00" (hora local, sin zona).
function diasHasta(iso: string | null): number | null {
  if (iso === null || iso === "") return null
  const destino = new Date(iso.slice(0, 10) + "T00:00:00")
  if (Number.isNaN(destino.getTime())) return null
  const hoy = new Date()
  const hoySinHora = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate())
  return Math.round((destino.getTime() - hoySinHora.getTime()) / DIA_MS)
}

const TONOS: Record<EstadoPlazo, TonoCiclo> = {
  vencido: "conflicto",
  "esta-semana": "revision",
  proximo: "borrador",
  completo: "aprobado",
  "sin-fecha": "borrador",
}

export function useRecordatorios() {
  const solicitudesQuery = useQuery({
    // Misma queryKey que el resto de la app: entrar al inicio no vuelve a pedir la lista.
    queryKey: ["solicitudes"],
    queryFn: fetchSolicitudes,
    staleTime: 10 * 1000,
  })

  const lista = solicitudesQuery.data ?? []

  // Una cadena por cada solicitud raíz (sin anterior). Cada eslabón se engancha al que lo
  // precede; el Set corta un ciclo de datos corruptos en vez de colgar el navegador.
  const raices = lista.filter((s) => s.solicitudAnteriorId === null)

  const recordatorios: Recordatorio[] = raices.map((raiz) => {
    const niveles: SolicitudDTO[] = [raiz]
    const vistos = new Set<number>([raiz.id])
    for (;;) {
      const ultimo = niveles[niveles.length - 1]
      const siguiente = lista.find((s) => s.solicitudAnteriorId === ultimo.id)
      if (siguiente === undefined || vistos.has(siguiente.id) || niveles.length >= 3) break
      vistos.add(siguiente.id)
      niveles.push(siguiente)
    }

    const inicio = raiz.fechaInscripcionPlanteada ?? null
    const fin = niveles[niveles.length - 1].fechaInscripcionPlanteada ?? null
    const hechos = niveles.filter((n) => (n.fechaInscripcionReal ?? "") !== "").length
    const dias = diasHasta(fin)

    let estadoPlazo: EstadoPlazo
    if (hechos === niveles.length) {
      estadoPlazo = "completo"
    } else if (dias === null) {
      estadoPlazo = "sin-fecha"
    } else if (dias < 0) {
      estadoPlazo = "vencido"
    } else if (dias <= 7) {
      estadoPlazo = "esta-semana"
    } else {
      estadoPlazo = "proximo"
    }

    return {
      id: raiz.id,
      proyecto: raiz.proyecto,
      version: raiz.version,
      ambiente: raiz.ambiente,
      sistema: raiz.sistema,
      niveles,
      inicio,
      fin,
      diasParaFin: dias,
      hechos,
      estadoPlazo,
      tono: TONOS[estadoPlazo],
    }
  })

  // Lo urgente primero: vencidas, después lo que cierra esta semana, después el resto, y
  // las completas al final (ya no son un recordatorio).
  const PESO: Record<EstadoPlazo, number> = {
    vencido: 0,
    "esta-semana": 1,
    proximo: 2,
    "sin-fecha": 3,
    completo: 4,
  }
  recordatorios.sort((a, b) => {
    if (PESO[a.estadoPlazo] !== PESO[b.estadoPlazo]) return PESO[a.estadoPlazo] - PESO[b.estadoPlazo]
    return (a.diasParaFin ?? 9999) - (b.diasParaFin ?? 9999)
  })

  const cuantos = (estado: EstadoPlazo) => recordatorios.filter((r) => r.estadoPlazo === estado).length

  return {
    solicitudesQuery,
    recordatorios,
    vencidos: cuantos("vencido"),
    estaSemana: cuantos("esta-semana"),
    proximos: cuantos("proximo"),
    completos: cuantos("completo"),
  }
}

export function textoPlazo(r: Recordatorio): string {
  if (r.estadoPlazo === "completo") return "Cadena cerrada"
  if (r.diasParaFin === null) return "Sin fecha de cierre"
  if (r.diasParaFin < 0) return `Vencida hace ${Math.abs(r.diasParaFin)} día${Math.abs(r.diasParaFin) === 1 ? "" : "s"}`
  if (r.diasParaFin === 0) return "Cierra hoy"
  if (r.diasParaFin === 1) return "Cierra mañana"
  return `Cierra en ${r.diasParaFin} días`
}
