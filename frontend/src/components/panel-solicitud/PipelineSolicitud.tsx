import { CheckIcon, CircleDotIcon, ClockIcon, LayersIcon } from "lucide-react"
import { cn } from "cn"
import { Card } from "@/components/ui/card"
import { BadgeCiclo } from "./BadgeCiclo"
import { pasosDe } from "@/components/inscripcion-form/types"
import type { EstadoPaso, PanelSolicitudApi } from "./usePanelSolicitud"

const CIRCULO: Record<EstadoPaso, string> = {
  completo: "bg-ciclo-aprobado text-background border-ciclo-aprobado",
  activo: "bg-primary text-primary-foreground border-primary ring-4 ring-primary/15",
  pendiente: "bg-card text-muted-foreground border-border",
}

const TONO_DETALLE = {
  completo: "aprobado",
  activo: "revision",
  pendiente: "borrador",
} as const

// 📌 PASOS DINAMICOS: el pipeline se dibuja desde la MISMA tabla pasosDe() que el wizard, asi
// que si el ambiente cambia los pasos, esta linea cambia sola. El switcher de arriba muestra
// cuantos pasos implica cada ambiente: el de la cadena esta activo, los otros son informativos
// (cambiar de ambiente es una actualizacion de la solicitud, no algo que se haga desde aca).
export function PipelineSolicitud({ panel }: { panel: PanelSolicitudApi }) {
  const ambienteCadena = panel.cadena[0]?.resumen.ambiente ?? null

  return (
    <Card className="gap-4 px-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="mt-0.5 h-10 w-1 rounded-full bg-primary" />
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <LayersIcon className="size-4 text-primary" />
              Cadena de inscripción
            </h3>
            <p className="text-xs text-muted-foreground">
              Ambiente <span className="font-medium text-foreground">{ambienteCadena ?? "—"}</span>
              {panel.conPaneles
                ? " — con etapas de verificación (checklist, pruebas y documentación)."
                : " — solo datos: este ambiente no lleva etapas de verificación."}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1 rounded-lg border bg-muted/50 p-1">
          {panel.ambientes.map((ambiente) => {
            const esPrincipal = ambiente.id === panel.ambientePrincipal?.id
            const cuantos = pasosDe("actualizar", esPrincipal).filter((p) => p !== "elegir-solicitud").length
            const activo = ambiente.nombre === ambienteCadena
            return (
              <span
                key={ambiente.id}
                title={activo ? "Ambiente de esta cadena" : `Con este ambiente serían ${cuantos} pasos`}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs whitespace-nowrap",
                  activo
                    ? "border bg-card font-medium text-foreground shadow-sm"
                    : "text-muted-foreground",
                )}
              >
                {ambiente.nombre} ({cuantos})
              </span>
            )
          })}
        </div>
      </div>

      {/* Scroll horizontal en vez de wrap: una cadena partida en dos renglones deja de leerse
          como una secuencia. */}
      <div className="-mx-4 overflow-x-auto px-4 pb-1">
        <ol className="flex min-w-max items-start gap-0">
          {panel.pipeline.map((paso, i) => (
            <li key={paso.paso} className="flex items-start">
              {i > 0 && <div className="mt-5 h-px w-10 shrink-0 bg-border lg:w-16" />}
              <div className="flex w-32 flex-col items-center gap-1.5 text-center lg:w-36">
                <div
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full border-2 transition-colors",
                    CIRCULO[paso.estadoPaso],
                  )}
                >
                  {paso.estadoPaso === "completo" ? (
                    <CheckIcon className="size-5" />
                  ) : paso.estadoPaso === "activo" ? (
                    <CircleDotIcon className="size-5" />
                  ) : (
                    <ClockIcon className="size-4" />
                  )}
                </div>
                <p
                  className={cn(
                    "text-xs font-medium",
                    paso.esNivelActual ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {paso.numero}. {paso.titulo}
                </p>
                <BadgeCiclo tono={TONO_DETALLE[paso.estadoPaso]}>{paso.detalle}</BadgeCiclo>
                <p className="text-[11px] text-muted-foreground">{paso.fecha ?? "—"}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Card>
  )
}
