import { CheckCircle2Icon, CircleIcon } from "lucide-react"
import type { FirmaItem } from "./types"

// Lectura (no edicion) del checklist de firmas -- usado en las Confirmaciones de la cadena,
// a diferencia de CampoFirmas (editable, en los pasos de datos).
export function ResumenFirmas({ items, valores }: { items: FirmaItem[]; valores: Record<string, boolean> }) {
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((item) => (
        <li key={item.campo} className="flex items-center gap-2">
          {valores[item.campo] ? (
            <CheckCircle2Icon className="size-4 text-primary" />
          ) : (
            <CircleIcon className="size-4 text-muted-foreground" />
          )}
          {item.etiqueta}
        </li>
      ))}
    </ul>
  )
}
