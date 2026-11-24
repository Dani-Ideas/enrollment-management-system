import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { TriangleAlertIcon } from "lucide-react"
import type { InscripcionFormApi } from "./useInscripcionForm"

// Fila de botones de la cadena -- "Finalizar y enviar" dispara la secuencia de peticiones
// con todo lo llenado hasta "hastaPaso" (puede ser parcial: el usuario no esta obligado a
// seguir toda la cadena). "Continuar" (si hay un siguiente nivel) solo avanza local, sin
// mandar nada. Ya no hay pasos de Confirmacion por nivel: esta fila va al pie del paso de
// cada nivel de "crear" (2/3/4/5/6). "deshabilitado" es para los pasos de datos, donde
// todavia no se puede ni enviar ni avanzar porque falta llenar campos obligatorios.
export function BotonesCadena({
  hastaPaso,
  siguientePaso,
  etiquetaSiguiente,
  deshabilitado = false,
  mutation,
  onEnviar,
  onContinuar,
}: {
  hastaPaso: number
  siguientePaso?: number
  etiquetaSiguiente?: string
  deshabilitado?: boolean
  mutation: InscripcionFormApi["cadenaMutation"]
  onEnviar: (hastaPaso: number) => void
  onContinuar?: (paso: number) => void
}) {
  return (
    <>
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={() => onEnviar(hastaPaso)}
          disabled={deshabilitado || mutation.isPending}
          className="w-fit"
        >
          {mutation.isPending && <Spinner />}
          Finalizar y enviar
        </Button>
        {siguientePaso !== undefined && onContinuar && (
          <Button
            variant="outline"
            onClick={() => onContinuar(siguientePaso)}
            disabled={deshabilitado || mutation.isPending}
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
