import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"

// Pie de un paso de "actualizar"/"consultar": a donde se va desde aca.
//
// Si hay un paso siguiente al que ir, un boton para avanzar; si no, este paso es el final
// del recorrido y en su lugar va la salida ("Actualizar/Consultar otra solicitud"), con un
// texto opcional que explique por que se termina aca (ej. la cadena no tiene secundaria).
// Los children son los botones propios del paso (ej. "Guardar cambios"), que van en la
// misma fila que el de avanzar.
export function PieNivel({
  hayPasoSiguiente,
  etiquetaSiguiente = "Siguiente",
  textoSinSiguiente,
  etiquetaSalir,
  onSiguiente,
  onSalir,
  children,
}: {
  hayPasoSiguiente: boolean
  etiquetaSiguiente?: string
  textoSinSiguiente?: string
  etiquetaSalir: string
  onSiguiente: () => void
  onSalir: () => void
  children?: ReactNode
}) {
  return (
    <>
      {!hayPasoSiguiente && textoSinSiguiente !== undefined && (
        <p className="text-sm text-muted-foreground">{textoSinSiguiente}</p>
      )}
      <div className="flex flex-wrap gap-2">
        {children}
        {hayPasoSiguiente ? (
          <Button onClick={onSiguiente} className="w-fit">
            {etiquetaSiguiente}
          </Button>
        ) : (
          <Button variant="outline" onClick={onSalir} className="w-fit">
            {etiquetaSalir}
          </Button>
        )}
      </div>
    </>
  )
}
