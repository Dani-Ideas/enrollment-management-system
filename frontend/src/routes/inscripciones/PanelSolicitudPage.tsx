import { Link } from "@tanstack/react-router"
import { panelSolicitudRoute } from "@/router"
import { TriangleAlertIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import {
  BannerSolicitud,
  CabeceraSolicitud,
  CompararNiveles,
  DisparoSiguienteNivel,
  LogCadena,
  MetricasSolicitud,
  PanelVerificacion,
  PipelineSolicitud,
  usePanelSolicitud,
} from "@/components/panel-solicitud"

// Panel de UNA solicitud: todo de lectura. Lo editable sigue viviendo en el wizard
// (/formulario-pago), y cada boton de accion de acá lleva para allá.
export function PanelSolicitudPage() {
  const { id } = panelSolicitudRoute.useParams()
  // El id viene de la URL, o sea que puede ser cualquier cosa: se valida antes de pedir nada.
  const solicitudId = Number(id)
  const idValido = Number.isInteger(solicitudId) && solicitudId > 0
  const panel = usePanelSolicitud(idValido ? solicitudId : 0)

  if (!idValido) {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>Id inválido</AlertTitle>
        <AlertDescription>"{id}" no es un número de solicitud.</AlertDescription>
      </Alert>
    )
  }

  if (panel.cargando) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner />
        Cargando la solicitud #{solicitudId}…
      </div>
    )
  }

  if (panel.error !== null) {
    return (
      <Alert variant="destructive">
        <TriangleAlertIcon />
        <AlertTitle>No se pudo cargar la solicitud</AlertTitle>
        <AlertDescription>{panel.error.message}</AlertDescription>
      </Alert>
    )
  }

  if (panel.actual === null) {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>No existe la solicitud #{solicitudId}</AlertTitle>
          <AlertDescription>
            No aparece en el listado. Puede que el id esté mal o que la hayan eliminado.
          </AlertDescription>
        </Alert>
        <Button variant="outline" nativeButton={false} render={<Link to="/solicitudes" />}>
          Volver a solicitudes
        </Button>
      </div>
    )
  }

  return (
    <section className="w-full space-y-4">
      <CabeceraSolicitud panel={panel} />
      <BannerSolicitud panel={panel} />
      <PipelineSolicitud panel={panel} />

      {/* Workbench de dos columnas del ejemplo: verificación a la izquierda, historial y
          métricas a la derecha. Abajo de xl se apila, que es lo que pide el ejemplo para
          pantallas chicas. */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-7">
          <PanelVerificacion panel={panel} />
          <DisparoSiguienteNivel panel={panel} />
        </div>
        <div className="space-y-4 xl:col-span-5">
          <LogCadena panel={panel} />
          <CompararNiveles panel={panel} />
          <MetricasSolicitud panel={panel} />
        </div>
      </div>
    </section>
  )
}
