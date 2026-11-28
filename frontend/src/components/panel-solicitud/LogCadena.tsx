import { Link } from "@tanstack/react-router"
import { FlagIcon, GitBranchIcon, UserIcon } from "lucide-react"
import { cn } from "cn"
import { Card } from "@/components/ui/card"
import { BadgeCiclo } from "./BadgeCiclo"
import { tonoDeEstado } from "./ciclo"
import type { PanelSolicitudApi } from "./usePanelSolicitud"

// El "Version & Revision Log" del ejemplo es, aca, la cadena misma: cada eslabon
// (Primaria -> Secundaria -> Universidad) es una version, y el texto del aviso de versiones
// hace de mensaje de commit. Cada eslabon enlaza a su propio panel.
export function LogCadena({ panel }: { panel: PanelSolicitudApi }) {
  return (
    <Card className="gap-3 px-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <GitBranchIcon className="size-4 text-primary" />
          Cadena y avisos de versión
        </h3>
        <BadgeCiclo tono="borrador">
          {panel.cadena.length} de 3 niveles
        </BadgeCiclo>
      </div>

      <ol className="space-y-2">
        {panel.cadena.map((eslabon, i) => {
          const s = eslabon.resumen
          const reporte = eslabon.detalle?.avisoVersiones?.reporte
          const esUltimo = i === panel.cadena.length - 1
          return (
            <li
              key={s.id}
              className={cn(
                "rounded-lg border p-3",
                eslabon.esActual ? "border-primary/40 bg-primary/5" : "bg-muted/30",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-card px-2 py-0.5 text-xs font-semibold ring-1 ring-border">
                    {s.version}
                  </span>
                  <BadgeCiclo tono={eslabon.esActual ? "revision" : "borrador"}>
                    {eslabon.esActual ? "Estás acá" : s.etapa}
                  </BadgeCiclo>
                  {esUltimo && (
                    <BadgeCiclo tono="aprobado">
                      <FlagIcon className="size-3" />
                      Último nivel
                    </BadgeCiclo>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {s.fechaInscripcionReal ?? s.fechaInscripcionPlanteada}
                </span>
              </div>

              <p className="mt-2 text-sm">
                {reporte !== undefined && reporte.trim() !== ""
                  ? `"${reporte}"`
                  : (s.descripcion ?? "Sin aviso de versiones cargado.")}
              </p>

              <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <UserIcon className="size-3" />
                  {s.jefeCarrera}
                </span>
                <span className="flex items-center gap-3">
                  <BadgeCiclo tono={tonoDeEstado(s.estado)}>{s.estado}</BadgeCiclo>
                  {!eslabon.esActual && (
                    <Link
                      to="/solicitud/$id"
                      params={{ id: String(s.id) }}
                      className="font-medium text-primary hover:underline"
                    >
                      Abrir #{s.id}
                    </Link>
                  )}
                </span>
              </div>
            </li>
          )
        })}
      </ol>

      {panel.cadena.length < 3 && (
        <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
          La cadena todavía no llega a Universidad. El nivel siguiente se crea desde el
          formulario, y solo se habilita cuando el nivel anterior tiene su VoBo completo.
        </p>
      )}
    </Card>
  )
}
