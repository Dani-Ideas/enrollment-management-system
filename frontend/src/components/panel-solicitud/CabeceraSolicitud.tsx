import { Link } from "@tanstack/react-router"
import { ChevronRightIcon, GitCompareIcon, PencilIcon, PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BadgeCiclo } from "./BadgeCiclo"
import { tonoDeEstado } from "./ciclo"
import type { PanelSolicitudApi } from "./usePanelSolicitud"

// Barra de contexto: miga de pan, titulo de la solicitud y las acciones que SI existen hoy.
// Cada accion sale del panel y entra al wizard con su ?accion= -- el panel no edita nada.
export function CabeceraSolicitud({ panel }: { panel: PanelSolicitudApi }) {
  const actual = panel.actual
  if (actual === null) return null

  return (
    <div className="space-y-3">
      <nav className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        <Link to="/solicitudes" className="hover:text-foreground">
          Solicitudes
        </Link>
        <ChevronRightIcon className="size-3" />
        <span>{actual.ambiente}</span>
        <ChevronRightIcon className="size-3" />
        <span className="truncate text-foreground">{actual.proyecto}</span>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <h2 className="text-seccion font-semibold tracking-titulo">{actual.proyecto}</h2>
          <div className="flex flex-wrap items-center gap-2">
            <BadgeCiclo tono="borrador">{actual.etapa}</BadgeCiclo>
            <BadgeCiclo tono={tonoDeEstado(actual.estado)}>{actual.estado}</BadgeCiclo>
            <span className="text-xs text-muted-foreground">{actual.sistema}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/formulario-pago" search={{ accion: "consultar" }} />}
          >
            <GitCompareIcon />
            Ver la cadena completa
          </Button>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to="/formulario-pago" search={{ accion: "actualizar" }} />}
          >
            <PencilIcon />
            Actualizar
          </Button>
          <Button
            size="sm"
            nativeButton={false}
            render={<Link to="/formulario-pago" search={{ accion: "crear" }} />}
          >
            <PlusIcon />
            Nueva solicitud
          </Button>
        </div>
      </div>
    </div>
  )
}
