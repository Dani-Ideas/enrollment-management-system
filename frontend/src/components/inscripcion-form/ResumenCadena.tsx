import type { Ref } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface FilaResumen {
  etiqueta: string
  valor: string
}

export interface SeccionResumen {
  titulo: string
  filas: FilaResumen[]
}

// ◽ RESUMEN -- ARCHIVO COMPLETO: este componente ES el panel de resumen.
export function ResumenCadena({
  secciones,
  ref,
}: {
  secciones: SeccionResumen[]
  ref?: Ref<HTMLDivElement>
}) {
  if (secciones.length === 0) {
    return null
  }

  return (
    <Card ref={ref} className="flex h-full flex-col overflow-hidden shadow-md ring-foreground/20">
      <CardHeader>
        <CardTitle className="text-sm">Resumen de la cadena</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-y-auto">
        {secciones.map((seccion) => (
          <div
            key={seccion.titulo}
            className="animate-in fade-in slide-in-from-left-4 space-y-1.5 duration-300"
          >
            <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{seccion.titulo}</p>
            <dl className="space-y-0.5 text-xs">
              {seccion.filas.map((fila) => (
                <div key={fila.etiqueta} className="flex items-baseline justify-between gap-2">
                  <dt className="text-muted-foreground">{fila.etiqueta}</dt>
                  <dd className="text-right font-medium">{fila.valor}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
