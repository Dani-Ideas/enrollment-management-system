import { CheckCircle2Icon, CircleIcon } from "lucide-react"
import type { VoBoDTO } from "@/api/types"

export function ResumenVoBo({ voBo }: { voBo: VoBoDTO | null }) {
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
