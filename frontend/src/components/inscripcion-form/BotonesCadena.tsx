import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Spinner } from "@/components/ui/spinner"
import { TriangleAlertIcon } from "lucide-react"
import type { InscripcionFormApi } from "./useInscripcionForm"

// 📌 PASOS DINAMICOS: "hastaPaso"/"siguientePaso" son indices del flujo, via pasoDe()/trasPaso().
// ⭐ Unico disparador del HTTP 2: manda "hastaPaso" y se auto-bloquea con mutation.isPending.
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
