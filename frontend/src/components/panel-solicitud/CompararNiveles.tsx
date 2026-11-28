import { useState } from "react"
import { ArrowRightIcon, GitCompareIcon } from "lucide-react"
import { cn } from "cn"
import { Card } from "@/components/ui/card"
import { NativeSelect } from "@/components/ui/native-select"
import { BadgeCiclo } from "./BadgeCiclo"
import type { EslabonCadena, PanelSolicitudApi } from "./usePanelSolicitud"

// Que se compara de cada eslabon. Es la lista de campos que de verdad puede cambiar entre
// un nivel y el siguiente -- los ids y la etapa quedan afuera porque siempre difieren y
// ensuciarian el diff.
const CAMPOS: { etiqueta: string; de: (e: EslabonCadena) => string }[] = [
  { etiqueta: "Proyecto", de: (e) => e.resumen.proyecto },
  { etiqueta: "Versión", de: (e) => e.resumen.version },
  { etiqueta: "Estado", de: (e) => e.resumen.estado },
  { etiqueta: "Sistema", de: (e) => e.resumen.sistema },
  { etiqueta: "Ambiente", de: (e) => e.resumen.ambiente },
  { etiqueta: "Jefe de carrera", de: (e) => e.resumen.jefeCarrera },
  { etiqueta: "Maestro", de: (e) => e.resumen.maestro },
  { etiqueta: "Carrera", de: (e) => e.resumen.carrera },
  { etiqueta: "Fecha planteada", de: (e) => e.resumen.fechaInscripcionPlanteada },
  { etiqueta: "Fecha real", de: (e) => e.resumen.fechaInscripcionReal ?? "—" },
  { etiqueta: "Descripción", de: (e) => e.resumen.descripcion ?? "—" },
  { etiqueta: "Filas de checklist", de: (e) => String(e.detalle?.checklist.length ?? 0) },
  { etiqueta: "Pruebas", de: (e) => String(e.detalle?.pruebas.length ?? 0) },
  { etiqueta: "Formaciones", de: (e) => String(e.detalle?.formacionesComplementarias.length ?? 0) },
]

// El "Compare Versions (Diff)" del ejemplo. Aca no hay texto que diffear linea por linea,
// pero si hay dos eslabones de la misma cadena con los mismos campos: el diff es campo a
// campo, y solo se pintan los que cambiaron.
export function CompararNiveles({ panel }: { panel: PanelSolicitudApi }) {
  const cadena = panel.cadena
  const [izquierdaId, setIzquierdaId] = useState<string>("")
  const [derechaId, setDerechaId] = useState<string>("")
  const [soloCambios, setSoloCambios] = useState(true)

  if (cadena.length < 2) {
    return (
      <Card className="gap-2 px-4">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <GitCompareIcon className="size-4 text-primary" />
          Comparar niveles
        </h3>
        <p className="text-sm text-muted-foreground">
          La cadena tiene un solo nivel. Cuando exista la secundaria se pueden comparar acá,
          campo por campo.
        </p>
      </Card>
    )
  }

  // Por defecto: los dos ultimos niveles, que es la comparacion que casi siempre se quiere.
  const izquierda =
    cadena.find((e) => String(e.resumen.id) === izquierdaId) ?? cadena[cadena.length - 2]
  const derecha = cadena.find((e) => String(e.resumen.id) === derechaId) ?? cadena[cadena.length - 1]

  const filas = CAMPOS.map((campo) => ({
    etiqueta: campo.etiqueta,
    izq: campo.de(izquierda),
    der: campo.de(derecha),
  }))
  const cambiadas = filas.filter((f) => f.izq !== f.der)
  const visibles = soloCambios ? cambiadas : filas

  return (
    <Card className="gap-3 px-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <GitCompareIcon className="size-4 text-primary" />
          Comparar niveles
        </h3>
        <BadgeCiclo tono={cambiadas.length === 0 ? "borrador" : "revision"}>
          {cambiadas.length} campo{cambiadas.length === 1 ? "" : "s"} distinto
          {cambiadas.length === 1 ? "" : "s"}
        </BadgeCiclo>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <NativeSelect
          value={String(izquierda.resumen.id)}
          onChange={(e) => setIzquierdaId(e.target.value)}
          className="w-auto min-w-0 flex-1"
        >
          {cadena.map((e) => (
            <option key={e.resumen.id} value={e.resumen.id}>
              {e.resumen.etapa} · {e.resumen.version}
            </option>
          ))}
        </NativeSelect>
        <ArrowRightIcon className="size-4 shrink-0 text-muted-foreground" />
        <NativeSelect
          value={String(derecha.resumen.id)}
          onChange={(e) => setDerechaId(e.target.value)}
          className="w-auto min-w-0 flex-1"
        >
          {cadena.map((e) => (
            <option key={e.resumen.id} value={e.resumen.id}>
              {e.resumen.etapa} · {e.resumen.version}
            </option>
          ))}
        </NativeSelect>
        <label className="flex shrink-0 cursor-pointer items-center gap-1.5 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={soloCambios}
            onChange={(e) => setSoloCambios(e.target.checked)}
            className="size-3.5 accent-primary"
          />
          Solo cambios
        </label>
      </div>

      {visibles.length === 0 ? (
        <p className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
          Los dos niveles tienen exactamente los mismos datos.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <div className="grid grid-cols-[auto_1fr_1fr] divide-x border-b bg-muted/50 text-xs font-semibold">
            <span className="px-3 py-2 text-muted-foreground">Campo</span>
            <span className="px-3 py-2">{izquierda.resumen.etapa}</span>
            <span className="px-3 py-2">{derecha.resumen.etapa}</span>
          </div>
          <div className="divide-y">
            {visibles.map((fila) => {
              const cambio = fila.izq !== fila.der
              return (
                <div key={fila.etiqueta} className="grid grid-cols-[auto_1fr_1fr] divide-x text-sm">
                  <span className="px-3 py-2 text-xs text-muted-foreground">{fila.etiqueta}</span>
                  <span className={cn("truncate px-3 py-2", cambio && "bg-ciclo-conflicto/10 text-ciclo-conflicto")}>
                    {fila.izq}
                  </span>
                  <span className={cn("truncate px-3 py-2", cambio && "bg-ciclo-aprobado/10 text-ciclo-aprobado")}>
                    {fila.der}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}
