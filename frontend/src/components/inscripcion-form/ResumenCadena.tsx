import type { Ref } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface FilaResumen {
  etiqueta: string
  valor: string
}

export interface SeccionResumen {
  titulo: string
  filas: FilaResumen[]
  // Hay datos escritos que TODAVIA no se enviaron. El resumen siempre mostro solo lo
  // guardado de verdad; esto permite mostrar tambien lo que falta mandar, sin que se
  // confunda con lo otro.
  pendiente?: boolean
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
            <p className="flex items-center justify-between gap-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
              <span>{seccion.titulo}</span>
              {seccion.pendiente === true && (
                <span className="rounded border border-dashed px-1.5 py-0.5 text-[10px] normal-case">
                  sin enviar
                </span>
              )}
            </p>
            <dl className={seccion.pendiente === true ? "space-y-0.5 text-xs opacity-60" : "space-y-0.5 text-xs"}>
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
