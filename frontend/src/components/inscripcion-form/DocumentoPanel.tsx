import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import type { DocumentoEditable } from "./types"

export function DocumentoPanel({
  idPrefix,
  valor,
  onCambiar,
  disabled = false,
}: {
  idPrefix: string
  valor: DocumentoEditable
  onCambiar: (nuevo: DocumentoEditable) => void
  disabled?: boolean
}) {
  const idCompleto = `${idPrefix}-doc-completo`
  return (
    <div className="space-y-2">
      <Field orientation="horizontal">
        <Checkbox
          id={idCompleto}
          checked={valor.completo}
          onCheckedChange={(v) => onCambiar({ ...valor, completo: v === true })}
          disabled={disabled}
        />
        <FieldLabel htmlFor={idCompleto}>Documentación completa</FieldLabel>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-doc-comentario`}>Comentario</FieldLabel>
        <Input
          id={`${idPrefix}-doc-comentario`}
          value={valor.comentario}
          onChange={(e) => onCambiar({ ...valor, comentario: e.target.value })}
          disabled={disabled}
        />
      </Field>
    </div>
  )
}
