import { Card } from "@/components/ui/card"
import type { PanelSolicitudApi } from "./usePanelSolicitud"

function Metrica({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3 text-center">
      <p className="text-xs text-muted-foreground">{etiqueta}</p>
      <p className="text-lg font-semibold tracking-titulo">{valor}</p>
    </div>
  )
}

// Las "Production Asset Metrics" del ejemplo, con lo que de verdad se puede contar hoy.
export function MetricasSolicitud({ panel }: { panel: PanelSolicitudApi }) {
  const detalle = panel.detalleActual
  if (detalle === undefined) return null

  const pruebasConRuta = detalle.pruebas.filter((p) => p.ruta.trim() !== "").length

  return (
    <Card className="gap-3 px-4">
      <h3 className="text-sm font-semibold">Métricas de la solicitud</h3>
      <div className="grid grid-cols-2 gap-2">
        <Metrica etiqueta="Filas de checklist" valor={String(detalle.checklist.length)} />
        <Metrica etiqueta="Pruebas con ruta" valor={`${pruebasConRuta} / ${detalle.pruebas.length}`} />
        <Metrica etiqueta="Formaciones compl." valor={String(detalle.formacionesComplementarias.length)} />
        <Metrica etiqueta="Avance de la cadena" valor={`${panel.porcentaje}%`} />
      </div>
    </Card>
  )
}
