import { CalendarIcon, GraduationCapIcon, HashIcon } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BadgeCiclo } from "./BadgeCiclo"
import type { PanelSolicitudApi } from "./usePanelSolicitud"

function Dato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 text-sm">
      <span className="text-muted-foreground">{etiqueta}</span>
      <span className="truncate text-right font-medium">{valor}</span>
    </div>
  )
}

// Banda de metadatos: 4 bloques separados por una linea de 1px, como la del ejemplo.
export function BannerSolicitud({ panel }: { panel: PanelSolicitudApi }) {
  const actual = panel.actual
  if (actual === null) return null

  const alDia = actual.fechaInscripcionReal !== null
  const formaciones = panel.detalleActual?.formacionesComplementarias.length ?? 0

  return (
    <Card className="px-4">
      <div className="grid grid-cols-1 gap-4 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
        <div className="flex gap-3 md:pr-4">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCapIcon className="size-5" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="truncate text-sm font-medium">{actual.jefeCarrera}</p>
            <p className="text-xs text-muted-foreground">Jefe de carrera</p>
            <p className="truncate text-xs text-muted-foreground">
              Maestro: <span className="text-foreground">{actual.maestro}</span>
            </p>
            <p className="truncate text-xs text-muted-foreground">
              Carrera: <span className="text-foreground">{actual.carrera}</span>
            </p>
          </div>
        </div>

        <div className="space-y-1.5 pt-4 md:pt-0 md:pl-4 xl:pr-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Identificación</p>
          <Dato etiqueta="Solicitud" valor={`#${actual.id}`} />
          <Dato etiqueta="Versión" valor={actual.version} />
          <Dato etiqueta="Ambiente" valor={actual.ambiente} />
        </div>

        <div className="space-y-1.5 pt-4 md:pt-0 md:pr-4 md:pl-4 xl:pl-4">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Fechas</p>
          <div className="flex items-center gap-2 text-sm">
            <span className={alDia ? "text-ciclo-aprobado" : "text-ciclo-revision"}>●</span>
            <span className="font-medium">{alDia ? "Inscripción realizada" : "Fecha real pendiente"}</span>
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CalendarIcon className="size-3.5" />
            Planteada: {actual.fechaInscripcionPlanteada}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <HashIcon className="size-3.5" />
            {formaciones} formación{formaciones === 1 ? "" : "es"} complementaria{formaciones === 1 ? "" : "s"}
          </p>
        </div>

        <div className="space-y-2 rounded-lg bg-muted/50 p-3 md:pl-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              Paso {panel.pasoActivo} de {panel.totalPasos}
            </p>
            <BadgeCiclo tono={panel.porcentaje === 100 ? "aprobado" : "revision"}>{panel.porcentaje}%</BadgeCiclo>
          </div>
          <p className="truncate text-sm font-medium">
            {panel.pipeline[panel.pasoActivo - 1]?.titulo ?? "Cadena completa"}
          </p>
          <Progress value={panel.porcentaje} className="h-1.5" />
        </div>
      </div>
    </Card>
  )
}
