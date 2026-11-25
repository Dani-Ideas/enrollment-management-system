import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { AvisoVersionEditable } from "./types"

export function AvisoVersionesPanel({
  idPrefix,
  valor,
  onCambiar,
  disabled = false,
}: {
  idPrefix: string
  valor: AvisoVersionEditable
  onCambiar: (nuevo: AvisoVersionEditable) => void
  disabled?: boolean
}) {
  return (
    <Field>
      <FieldLabel htmlFor={`${idPrefix}-aviso-reporte`}>Aviso de versiones (reporte)</FieldLabel>
      <Input
        id={`${idPrefix}-aviso-reporte`}
        value={valor.reporte}
        onChange={(e) => onCambiar({ reporte: e.target.value })}
        disabled={disabled}
      />
    </Field>
  )
}
