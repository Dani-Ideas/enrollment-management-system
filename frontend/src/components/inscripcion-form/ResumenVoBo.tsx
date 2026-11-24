import { CheckCircle2Icon, CircleIcon } from "lucide-react"
import type { VoBoDTO } from "@/api/types"

// Lectura (no edicion) del VoBo de un nivel -- SIEMPRE lo que calculo el servidor
// (InscripcionVoBoRecalculador), nunca algo que el front recalcule. Reemplaza a
// ResumenFirmas en las Confirmaciones de la cadena. "voBo" es null si todavia no se guardo
// ningun panel para ese nivel (el servidor no tiene de donde calcularlo).
export function ResumenVoBo({ voBo }: { voBo: VoBoDTO | null }) {
  // "!voBo" (no "voBo === null"): el backend OMITE la clave "voBo" del JSON cuando no hay
  // fila todavia (1:1 opcional), en vez de mandar "voBo: null" -- JSON.parse la deja
  // "undefined", no "null", y un chequeo estricto contra null no lo agarraba (crasheaba
  // leyendo voBo.pruebas de undefined apenas se llegaba a una Confirmacion sin paneles
  // guardados).
  if (!voBo) {
    return <p className="text-sm text-muted-foreground">Todavía no se guardó ningún panel para este nivel.</p>
  }

  const filas: { etiqueta: string; completo: boolean }[] = [
    { etiqueta: "Pruebas", completo: voBo.pruebas },
    { etiqueta: "Checklist", completo: voBo.checklist },
    { etiqueta: "Documentación", completo: voBo.documentacion },
  ]

  return (
    <ul className="space-y-1.5 text-sm">
      {filas.map((fila) => (
        <li key={fila.etiqueta} className="flex items-center gap-2">
          {fila.completo ? (
            <CheckCircle2Icon className="size-4 text-primary" />
          ) : (
            <CircleIcon className="size-4 text-muted-foreground" />
          )}
          {fila.etiqueta}
        </li>
      ))}
    </ul>
  )
}
