import { Link } from "@tanstack/react-router"
import { CheckIcon, MailIcon, XIcon, ZapIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BadgeCiclo } from "./BadgeCiclo"
import type { PanelSolicitudApi } from "./usePanelSolicitud"

const SIGUIENTE: Record<string, string | null> = {
  Primaria: "Secundaria",
  Secundaria: "Universidad",
  Universidad: null,
}

function Condicion({ cumple, texto }: { cumple: boolean; texto: string }) {
  return (
    <li className="flex items-center gap-2 text-sm">
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-full",
          cumple ? "bg-ciclo-aprobado/15 text-ciclo-aprobado" : "bg-ciclo-borrador/15 text-ciclo-borrador",
        )}
      >
        {cumple ? <CheckIcon className="size-3" /> : <XIcon className="size-3" />}
      </span>
      <span className={cumple ? "text-muted-foreground line-through" : ""}>{texto}</span>
    </li>
  )
}

// El "Automated Dispatch Trigger" del ejemplo, con la regla que SI existe en este dominio:
// el nivel siguiente de la cadena no se habilita hasta que el VoBo de este este completo
// (el backend responde 409 si se intenta antes). El interruptor refleja esa condicion, no
// es un ajuste que se pueda apagar: no hay nada que configurar del lado del servidor.
export function DisparoSiguienteNivel({ panel }: { panel: PanelSolicitudApi }) {
  const actual = panel.actual
  const detalle = panel.detalleActual
  if (actual === null || detalle === undefined) return null

  const voBo = detalle.voBo
  const listo = panel.voBoActual.listos === panel.voBoActual.total
  const siguiente = SIGUIENTE[actual.etapa] ?? null
  const yaExiste = panel.cadena.some((e) => e.resumen.etapa === siguiente)
  const reporte = detalle.avisoVersiones?.reporte ?? ""

  return (
    <Card className="gap-3 px-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              listo ? "bg-ciclo-aprobado/15 text-ciclo-aprobado" : "bg-muted text-muted-foreground",
            )}
          >
            <ZapIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Disparo del nivel siguiente</h3>
            <p className="text-xs text-muted-foreground">
              {siguiente === null
                ? "Universidad es el último nivel de la cadena: no dispara nada más."
                : `Se habilita ${siguiente} cuando esta solicitud tenga su VoBo completo.`}
            </p>
          </div>
        </div>

        {/* Interruptor de solo lectura: muestra si la condicion se cumple. */}
        <span
          aria-hidden
          className={cn(
            "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
            listo ? "bg-ciclo-aprobado justify-end" : "bg-muted-foreground/30 justify-start",
          )}
        >
          <span className="size-5 rounded-full bg-background shadow-sm" />
        </span>
      </div>

      <div className="rounded-lg border bg-muted/30 p-3">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            Condiciones de la regla
          </p>
          <BadgeCiclo tono={listo ? "aprobado" : "revision"}>
            {panel.voBoActual.listos} de {panel.voBoActual.total}
          </BadgeCiclo>
        </div>
        <ul className="space-y-1.5">
          <Condicion cumple={voBo?.checklist === true} texto="Checklist verificado" />
          <Condicion cumple={voBo?.pruebas === true} texto="Pruebas verificadas" />
          <Condicion cumple={voBo?.documentacion === true} texto="Documentación verificada" />
        </ul>
      </div>

      {siguiente !== null && (
        <div className="space-y-2">
          <p className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
            <MailIcon className="size-3.5" />
            Aviso que queda registrado
          </p>
          <div className="rounded-lg border border-dashed p-3 text-sm">
            <p className="text-xs text-muted-foreground">
              Asunto: VoBo de {actual.etapa.toLowerCase()} — {actual.proyecto} ({actual.version})
            </p>
            <p className="mt-1.5">
              {reporte.trim() !== ""
                ? `"${reporte}"`
                : "Sin aviso de versiones cargado todavía: se escribe en el paso de verificación."}
            </p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-md border bg-card px-2 py-0.5">{actual.jefeCarrera} (jefe de carrera)</span>
              <span className="rounded-md border bg-card px-2 py-0.5">{actual.maestro} (maestro)</span>
            </div>
          </div>

          <Button
            size="sm"
            className="w-fit"
            disabled={!listo || yaExiste}
            nativeButton={false}
            render={<Link to="/formulario-pago" search={{ accion: "actualizar" }} />}
          >
            {yaExiste ? `${siguiente} ya existe en la cadena` : `Crear ${siguiente}`}
          </Button>
          {!listo && !yaExiste && (
            <p className="text-xs text-muted-foreground">
              El botón se habilita solo cuando las 3 condiciones están en verde.
            </p>
          )}
        </div>
      )}
    </Card>
  )
}
