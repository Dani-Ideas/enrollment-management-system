import { useQueries, useQuery } from "@tanstack/react-query"
import { CATALOGOS_INSCRIPCION_QUERY, fetchSolicitud, fetchSolicitudes } from "@/api/client"
import type { SolicitudConPanelesDTO, SolicitudDTO } from "@/api/types"
import { pasosDe, type PasoCadena } from "@/components/inscripcion-form/types"

export type EstadoPaso = "completo" | "activo" | "pendiente"

export interface PasoPipeline {
  paso: PasoCadena
  numero: number
  titulo: string
  estadoPaso: EstadoPaso
  detalle: string
  fecha: string | null
  esNivelActual: boolean
}

export interface EslabonCadena {
  resumen: SolicitudDTO
  detalle: SolicitudConPanelesDTO | undefined
  esActual: boolean
}

// Titulo corto de cada paso para el pipeline. Los de ETIQUETAS (types.ts) son frases largas
// pensadas para el encabezado del wizard; aca entran debajo de un circulo de 40px.
const TITULO_PASO: Partial<Record<PasoCadena, string>> = {
  "datos-primaria": "Primaria",
  "paneles-primaria": "Verificación primaria",
  "datos-secundaria": "Secundaria",
  "paneles-secundaria": "Verificación secundaria",
  "datos-universidad": "Universidad",
  "paneles-universidad": "Verificación universidad",
}

// Que nivel de la cadena mira cada paso. El pipeline del panel es la cadena entera, asi que
// cada paso se resuelve contra el eslabon que le toca, no contra un estado de navegacion.
const NIVEL_DE_PASO: Partial<Record<PasoCadena, number>> = {
  "datos-primaria": 0,
  "paneles-primaria": 0,
  "datos-secundaria": 1,
  "paneles-secundaria": 1,
  "datos-universidad": 2,
  "paneles-universidad": 2,
}

export function esPasoDePaneles(paso: PasoCadena): boolean {
  return paso.startsWith("paneles-")
}

function cuentaVoBo(detalle: SolicitudConPanelesDTO | undefined): { listos: number; total: number } {
  const voBo = detalle?.voBo
  if (voBo === undefined || voBo === null) return { listos: 0, total: 3 }
  return {
    listos: [voBo.checklist, voBo.pruebas, voBo.documentacion].filter(Boolean).length,
    total: 3,
  }
}

export function usePanelSolicitud(solicitudId: number) {
  const catalogosQuery = useQuery(CATALOGOS_INSCRIPCION_QUERY)
  const solicitudesQuery = useQuery({
    // Misma queryKey que usa el wizard: entrar al panel desde la lista no vuelve a pedirla.
    queryKey: ["solicitudes"],
    queryFn: fetchSolicitudes,
    staleTime: 10 * 1000,
  })

  const lista = solicitudesQuery.data ?? []
  const actual = lista.find((s) => s.id === solicitudId) ?? null

  // La cadena completa, siempre en orden Primaria -> Secundaria -> Universidad: se camina
  // para atras por solicitudAnteriorId hasta la raiz y despues para adelante. Vale entrar
  // por cualquier eslabon, igual que en el wizard.
  const cadenaResumen: SolicitudDTO[] = []
  if (actual !== null) {
    let raiz = actual
    const vistos = new Set<number>([raiz.id])
    while (raiz.solicitudAnteriorId !== null) {
      const anterior = lista.find((s) => s.id === raiz.solicitudAnteriorId)
      // El Set corta un ciclo de datos corruptos en vez de colgar el navegador.
      if (anterior === undefined || vistos.has(anterior.id)) break
      vistos.add(anterior.id)
      raiz = anterior
    }
    cadenaResumen.push(raiz)
    for (;;) {
      const ultimo = cadenaResumen[cadenaResumen.length - 1]
      const siguiente = lista.find((s) => s.solicitudAnteriorId === ultimo.id)
      if (siguiente === undefined || vistos.has(siguiente.id) || cadenaResumen.length >= 3) break
      vistos.add(siguiente.id)
      cadenaResumen.push(siguiente)
    }
  }

  // Un detalle por eslabon (como mucho 3 llamadas). Hace falta el detalle de TODOS, no solo
  // del actual, porque el pipeline muestra el VoBo de cada nivel.
  const detallesQueries = useQueries({
    queries: cadenaResumen.map((s) => ({
      queryKey: ["solicitud", s.id] as const,
      queryFn: () => fetchSolicitud(s.id),
      staleTime: 10 * 1000,
    })),
  })

  const cadena: EslabonCadena[] = cadenaResumen.map((resumen, i) => ({
    resumen,
    detalle: detallesQueries[i]?.data,
    esActual: resumen.id === solicitudId,
  }))

  const detalleActual = cadena.find((e) => e.esActual)?.detalle
  const nivelActual = cadena.findIndex((e) => e.esActual)

  // El ambiente que manda es el de la Primaria (es el de la cadena). Mismo criterio que el
  // wizard: el ambiente principal es el del id MAS CHICO, nunca ambientes[0] -- el backend
  // sirve los catalogos desde un ConcurrentHashMap y el orden es indefinido.
  const ambientes = catalogosQuery.data?.ambientes ?? []
  const ambientePrincipal =
    ambientes.length === 0 ? null : ambientes.reduce((a, b) => (a.id <= b.id ? a : b))
  const ambienteCadena = cadena[0]?.resumen.ambiente ?? null
  const conPaneles =
    ambientePrincipal === null || ambienteCadena === null || ambienteCadena === ambientePrincipal.nombre

  // 📌 PASOS DINAMICOS: el pipeline es la MISMA tabla de pasos que el wizard, sin el paso de
  // elegir solicitud (aca la solicitud ya esta elegida: es la de la URL).
  const pasos = pasosDe("actualizar", conPaneles).filter((p) => p !== "elegir-solicitud")

  const completos: boolean[] = pasos.map((paso) => {
    const nivel = NIVEL_DE_PASO[paso] ?? 0
    const eslabon = cadena[nivel]
    if (eslabon === undefined) return false
    if (!esPasoDePaneles(paso)) return true
    const { listos, total } = cuentaVoBo(eslabon.detalle)
    return listos === total
  })
  const indiceActivo = completos.indexOf(false)

  const pipeline: PasoPipeline[] = pasos.map((paso, i) => {
    const nivel = NIVEL_DE_PASO[paso] ?? 0
    const eslabon = cadena[nivel]
    const estadoPaso: EstadoPaso = completos[i] ? "completo" : i === indiceActivo ? "activo" : "pendiente"

    let detalle: string
    if (eslabon === undefined) {
      detalle = "Sin crear"
    } else if (esPasoDePaneles(paso)) {
      const { listos, total } = cuentaVoBo(eslabon.detalle)
      detalle = `VoBo ${listos}/${total}`
    } else {
      detalle = `#${eslabon.resumen.id}`
    }

    return {
      paso,
      numero: i + 1,
      titulo: TITULO_PASO[paso] ?? paso,
      estadoPaso,
      detalle,
      fecha:
        eslabon === undefined || esPasoDePaneles(paso)
          ? null
          : (eslabon.resumen.fechaInscripcionReal ?? eslabon.resumen.fechaInscripcionPlanteada),
      esNivelActual: nivel === nivelActual,
    }
  })

  const hechos = completos.filter(Boolean).length
  const voBoActual = cuentaVoBo(detalleActual)

  return {
    catalogosQuery,
    solicitudesQuery,
    ambientes,
    ambientePrincipal,
    conPaneles,

    actual,
    detalleActual,
    cadena,
    nivelActual,

    pipeline,
    pasoActivo: indiceActivo === -1 ? pipeline.length : indiceActivo + 1,
    totalPasos: pipeline.length,
    porcentaje: pipeline.length === 0 ? 0 : Math.round((hechos / pipeline.length) * 100),
    voBoActual,

    cargando: solicitudesQuery.isLoading || detallesQueries.some((q) => q.isLoading),
    error: (solicitudesQuery.error ?? detallesQueries.find((q) => q.error)?.error ?? null) as Error | null,
  }
}

export type PanelSolicitudApi = ReturnType<typeof usePanelSolicitud>
