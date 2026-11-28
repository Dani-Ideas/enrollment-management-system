import { Link } from "@tanstack/react-router"
import { ChevronDownIcon, ChevronUpIcon, ExternalLinkIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { DetalleInscripcion } from "./DetalleInscripcion"
import type { InscripcionDTO } from "@/api/types"

type Props =
  | {
      modo: "detalle"
      inscripciones: InscripcionDTO[]
      cargando?: boolean
      detalleAbiertoId: number | null
      onAlternarDetalle: (id: number) => void
    }
  | {
      modo: "seleccionar"
      inscripciones: InscripcionDTO[]
      cargando?: boolean
      onSeleccionar: (id: number) => void
    }

export function CampoVistaDetalle(props: Props) {
  const { inscripciones, cargando = false } = props

  return (
    <div className="space-y-2">
      {cargando && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Cargando lista…
        </div>
      )}

      {props.modo === "seleccionar"
        ? inscripciones.map((inscripcion) => (
            <button
              key={inscripcion.id}
              type="button"
              onClick={() => props.onSeleccionar(inscripcion.id)}
              className="flex w-full items-center justify-between rounded-lg border border-input p-3 text-left text-sm hover:border-primary/40 hover:bg-primary/5"
            >
              <span>
                #{inscripcion.id} · {inscripcion.proyecto} ({inscripcion.version})
              </span>
              <span className="text-xs text-muted-foreground">{inscripcion.estado}</span>
            </button>
          ))
        : inscripciones.map((inscripcion) => {
            const abierto = props.detalleAbiertoId === inscripcion.id
            return (
              <div key={inscripcion.id} className="rounded-lg border border-input p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    #{inscripcion.id} · {inscripcion.proyecto} ({inscripcion.version}) · {inscripcion.estado}
                  </p>
                  <div className="flex shrink-0 items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => props.onAlternarDetalle(inscripcion.id)}
                    >
                      {abierto ? <ChevronUpIcon /> : <ChevronDownIcon />}
                      Ver detalle
                    </Button>
                    {/* Entrada al panel de la solicitud (la pantalla nueva). El detalle de
                        aca al lado sigue igual: son dos niveles de lectura distintos. */}
                    <Button
                      variant="outline"
                      size="sm"
                      nativeButton={false}
                      render={<Link to="/solicitud/$id" params={{ id: String(inscripcion.id) }} />}
                    >
                      <ExternalLinkIcon />
                      Panel
                    </Button>
                  </div>
                </div>
                {abierto && (
                  <div className="mt-3 border-t border-dashed border-input pt-3">
                    <DetalleInscripcion inscripcion={inscripcion} />
                  </div>
                )}
              </div>
            )
          })}
    </div>
  )
}
