import { CheckCircle2Icon, TriangleAlertIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { DetalleInscripcion } from "./DetalleInscripcion"
import type { InscripcionFormApi } from "./useInscripcionForm"

// Paso "confirmar-creacion" (solo "crear"): la unica Confirmacion previa a un POST de toda
// la cadena. Antes de crear muestra lo que se va a mandar; despues, lo que quedo creado y
// las dos salidas posibles (seguir la cadena, que es OPCIONAL, o arrancar otra solicitud).
export function PasoConfirmarCreacion({ wizard }: { wizard: InscripcionFormApi }) {
  const { crearSolicitudMutation, llevaPaneles, trasPaso, continuarCadena } = wizard

  if (crearSolicitudMutation.isSuccess) {
    const { solicitud, formacionesComplementarias } = crearSolicitudMutation.data
    const cuantas = formacionesComplementarias.length
    return (
      <div className="space-y-4">
        <Alert>
          <CheckCircle2Icon />
          <AlertTitle>Solicitud #{solicitud.id} creada</AlertTitle>
        </Alert>
        <DetalleInscripcion inscripcion={solicitud} />
        {cuantas > 0 && (
          <Alert>
            <CheckCircle2Icon />
            <AlertTitle>
              {cuantas} formación{cuantas === 1 ? "" : "es"} complementaria{cuantas === 1 ? "" : "s"} creada
              {cuantas === 1 ? "" : "s"}
            </AlertTitle>
          </Alert>
        )}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => continuarCadena(trasPaso("confirmar-creacion"))} className="w-fit">
            {llevaPaneles ? "Continuar con checklist, pruebas y documentación" : "Continuar con secundaria"}
          </Button>
          <Button onClick={wizard.crearOtra} className="w-fit">
            Crear otra solicitud
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium">Revisá antes de finalizar</h3>
      <DetalleInscripcion inscripcion={wizard.camposAVistaPrevia(wizard.campos)} />
      <Button
        onClick={wizard.crearSolicitudConFormaciones}
        disabled={!wizard.formularioCompleto || crearSolicitudMutation.isPending}
        className="w-fit"
      >
        Finalizar y crear
      </Button>
      {crearSolicitudMutation.isError && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>No se pudo crear la solicitud</AlertTitle>
          <AlertDescription>{(crearSolicitudMutation.error as Error).message}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

// Paso "confirmar-cadena" (solo "crear"): el UNICO lugar que muestra el resultado del
// "Finalizar y enviar", sin importar desde que paso se haya disparado (ver
// cadenaMutation.onSuccess en useInscripcionForm).
export function PasoConfirmarCadena({ wizard }: { wizard: InscripcionFormApi }) {
  if (!wizard.cadenaMutation.isSuccess) {
    return (
      <p className="text-sm text-muted-foreground">
        Todavía no se envió nada de la cadena. «Finalizar y enviar» está en cada paso (no hace
        falta llegar hasta acá) y el resultado se muestra en este.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <Alert>
        <CheckCircle2Icon />
        <AlertTitle>Cadena enviada</AlertTitle>
      </Alert>
      <Button onClick={wizard.crearOtra} className="w-fit">
        Crear otra solicitud
      </Button>
    </div>
  )
}
