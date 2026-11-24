import { TriangleAlertIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CampoSelect } from "./CampoSelect"
import { CampoVistaDetalle } from "./CampoVistaDetalle"
import type { InscripcionFormApi } from "./useInscripcionForm"

// Paso "lista": el catalogo de solicitudes de solo lectura, sin cadena ni formulario
// detras -- se busca por numero o se filtra por categoria (CampoSelect decide cual de los
// dos modos se ve) y cada fila se puede desplegar para ver su detalle.
export function PasoLista({ wizard }: { wizard: InscripcionFormApi }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">Inscripciones</h3>
      <CampoSelect
        idPrefix="pago-tf-lista"
        valor={wizard.listaIdInput}
        onCambiarValor={wizard.setListaIdInput}
        onBuscar={wizard.buscarPorIdInput}
        buscando={wizard.buscarSolicitudMutation.isPending}
        hayError={wizard.buscarSolicitudMutation.isError}
        resultado={wizard.buscarSolicitudMutation.data}
        filtros={wizard.filtrosSolicitudes}
      />
      <CampoVistaDetalle
        modo="detalle"
        inscripciones={wizard.solicitudesQuery.data ?? []}
        detalleAbiertoId={wizard.detalleAbiertoId}
        onAlternarDetalle={wizard.alternarDetalle}
      />
    </div>
  )
}

// Paso "elegir-solicitud": la puerta de entrada de "actualizar" y "consultar". Es el MISMO
// selector para las dos (misma lista, mismo componente): lo que cambia es lo que se hace
// despues con la solicitud elegida, no como se elige.
export function PasoElegirSolicitud({ wizard }: { wizard: InscripcionFormApi }) {
  const { accion, consultarMutation, actualizarCargaMutation } = wizard
  const carga = accion === "consultar" ? consultarMutation : actualizarCargaMutation

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Elegí cualquier solicitud de la cadena -- se recorre toda la cadena completa a partir
        de su Primaria ({accion === "consultar" ? "de solo lectura" : "editable"}, si tiene
        Secundaria y/o Universidad encadenadas también se incluyen).
      </p>
      <CampoSelect
        idPrefix="pago-tf"
        valor={wizard.listaIdInput}
        onCambiarValor={wizard.setListaIdInput}
        onBuscar={wizard.buscarPorIdInput}
        buscando={wizard.buscarSolicitudMutation.isPending}
        hayError={wizard.buscarSolicitudMutation.isError}
      />
      <CampoVistaDetalle
        modo="seleccionar"
        inscripciones={wizard.solicitudesQuery.data ?? []}
        cargando={wizard.solicitudesQuery.isLoading}
        onSeleccionar={wizard.elegirSolicitud}
      />
      {carga.isError && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>No se pudo cargar la cadena</AlertTitle>
          <AlertDescription>{(carga.error as Error).message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
