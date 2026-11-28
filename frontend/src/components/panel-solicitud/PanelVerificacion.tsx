import { Link } from "@tanstack/react-router"
import { CheckIcon, ClipboardCheckIcon, FileTextIcon, FlaskConicalIcon, UserIcon } from "lucide-react"
import { cn } from "cn"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { BadgeCiclo } from "./BadgeCiclo"
import { tonoDeEstado } from "./ciclo"
import type { PanelSolicitudApi } from "./usePanelSolicitud"

// Casilla de solo lectura: el panel no edita: para cambiar algo se va al wizard. Es un
// cuadrito dibujado, no un <input disabled>, para que no parezca un control apagado.
function Casilla({ marcada }: { marcada: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border",
        marcada ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card",
      )}
    >
      {marcada && <CheckIcon className="size-3" />}
    </span>
  )
}

// Las "verification gates" del ejemplo son el checklist real de la solicitud. Cada fila
// trae su estado y su responsable del catalogo, asi que el badge de la derecha es dato, no
// decoracion.
export function PanelVerificacion({ panel }: { panel: PanelSolicitudApi }) {
  const detalle = panel.detalleActual
  const actual = panel.actual
  if (detalle === undefined || actual === null) return null

  const voBo = detalle.voBo
  const checklistListo = voBo?.checklist === true
  const pasoActual = panel.pipeline.find((p) => p.esNivelActual && p.estadoPaso !== "completo")

  const responsables = [
    { rol: "Jefe de carrera", nombre: actual.jefeCarrera },
    { rol: "Maestro", nombre: actual.maestro },
    { rol: "Carrera", nombre: actual.carrera },
  ]

  return (
    <Card className="gap-4 px-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ClipboardCheckIcon className="size-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">
              {pasoActual === undefined
                ? `Verificación de ${actual.etapa.toLowerCase()}`
                : `Paso ${pasoActual.numero}: ${pasoActual.titulo}`}
            </h3>
            <p className="text-xs text-muted-foreground">
              Checklist, pruebas y documentación de la solicitud #{actual.id}.
            </p>
          </div>
        </div>
        <BadgeCiclo tono={panel.voBoActual.listos === 3 ? "aprobado" : "revision"}>
          VoBo {panel.voBoActual.listos}/{panel.voBoActual.total}
        </BadgeCiclo>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Checklist ({detalle.checklist.length})
        </p>
        {detalle.checklist.length === 0 && (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
            Esta solicitud todavía no tiene filas de checklist.
          </p>
        )}
        {detalle.checklist.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted/60"
          >
            <Casilla marcada={checklistListo} />
            <div className="min-w-0 flex-1">
              <p className={cn("text-sm font-medium", checklistListo && "text-muted-foreground line-through")}>
                {item.seccion} · {item.actividad}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {item.descripcion}
                {item.conexion !== "" && ` — ${item.conexion}`}
              </p>
              <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                <UserIcon className="size-3" />
                {item.responsable}
              </p>
            </div>
            <BadgeCiclo tono={tonoDeEstado(item.estado)}>{item.estado}</BadgeCiclo>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="flex items-start gap-3 rounded-lg border p-3">
          <FlaskConicalIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Pruebas ({detalle.pruebas.length})</p>
            <p className="truncate text-xs text-muted-foreground">
              {detalle.pruebas.length === 0
                ? "Sin pruebas cargadas."
                : detalle.pruebas.map((p) => p.tipoPrueba).join(", ")}
            </p>
          </div>
          <BadgeCiclo tono={voBo?.pruebas === true ? "aprobado" : "borrador"}>
            {voBo?.pruebas === true ? "Completo" : "Pendiente"}
          </BadgeCiclo>
        </div>

        <div className="flex items-start gap-3 rounded-lg border p-3">
          <FileTextIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">Documentación</p>
            <p className="truncate text-xs text-muted-foreground">
              {detalle.documento?.comentario ?? "Sin documento cargado."}
            </p>
          </div>
          <BadgeCiclo tono={voBo?.documentacion === true ? "aprobado" : "borrador"}>
            {voBo?.documentacion === true ? "Completo" : "Pendiente"}
          </BadgeCiclo>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Responsables</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {responsables.map((r) => (
            <div key={r.rol} className="flex items-center gap-2 rounded-lg border p-2.5">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                {r.nombre.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{r.nombre}</p>
                <p className="text-xs text-muted-foreground">{r.rol}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-fit"
        nativeButton={false}
        render={<Link to="/formulario-pago" search={{ accion: "actualizar" }} />}
      >
        Editar esta verificación en el formulario
      </Button>
    </Card>
  )
}
