import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { TriangleAlertIcon } from "lucide-react"
import type { InscripcionFormApi } from "./useInscripcionForm"

// Fila de botones de una Confirmacion de la cadena -- "Finalizar y enviar" dispara la UNICA
// peticion HTTP con todo lo llenado hasta "hastaPaso" (puede ser parcial: el usuario no esta
// obligado a seguir toda la cadena). "Continuar" (si hay un siguiente nivel) solo avanza
// local, sin mandar nada. Mismo componente para las 5 Confirmaciones (pasos 3/5/7/9/11).
export function BotonesCadena({
  hastaPaso,
  siguientePaso,
  etiquetaSiguiente,
  mutation,
  onEnviar,
  onContinuar,
}: {
  hastaPaso: number
  siguientePaso?: number
  etiquetaSiguiente?: string
  mutation: InscripcionFormApi["cadenaDiplomasMutation"]
  onEnviar: (hastaPaso: number) => void
  onContinuar?: (paso: number) => void
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => onEnviar(hastaPaso)} disabled={mutation.isPending} className="w-fit">
          {mutation.isPending && <Spinner />}
          Finalizar y enviar
        </Button>
        {siguientePaso !== undefined && onContinuar && (
          <Button
            variant="outline"
            onClick={() => onContinuar(siguientePaso)}
            disabled={mutation.isPending}
            className="w-fit"
          >
            {etiquetaSiguiente}
          </Button>
        )}
      </div>
      {mutation.isError && (
        <Alert variant="destructive">
          <TriangleAlertIcon />
          <AlertTitle>No se pudo enviar la cadena</AlertTitle>
          <AlertDescription>{(mutation.error as Error).message}</AlertDescription>
        </Alert>
      )}
    </>
  )
}
