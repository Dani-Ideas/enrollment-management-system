import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { AvisoVersionEditable } from "./types"

// 1:1 con la solicitud -- un solo campo de texto.
export function AvisoVersionesPanel({
  idPrefix,
  valor,
  onCambiar,
}: {
  idPrefix: string
  valor: AvisoVersionEditable
  onCambiar: (nuevo: AvisoVersionEditable) => void
}) {
  return (
    <Field>
      <FieldLabel htmlFor={`${idPrefix}-aviso-reporte`}>Aviso de versiones (reporte)</FieldLabel>
      <Input
        id={`${idPrefix}-aviso-reporte`}
        value={valor.reporte}
        onChange={(e) => onCambiar({ reporte: e.target.value })}
      />
    </Field>
  )
}
