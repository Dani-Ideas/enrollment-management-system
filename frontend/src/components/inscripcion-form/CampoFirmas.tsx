import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldLabel } from "@/components/ui/field"
import type { FirmaItem } from "./types"

// Checklist generico de firmas -- la MISMA UI para los 3 diplomas de la cadena (Primaria:
// 7 firmas, Secundaria: 5, Universidad: 4), solo cambia la lista de items y a que objeto de
// estado local escribe (ver useInscripcionForm: diplomaPrimariaFirmas/diplomaSecundariaFirmas/
// diplomaUniversidadFirmas). No pasa por TanStack Form -- a diferencia de Catalogo/
// Responsables/DatosProyecto (ligados a "form"), estos campos de la cadena son locales
// hasta el envio final (ver CadenaDiplomasRequestDTO).
export function CampoFirmas({
  idPrefix,
  items,
  valores,
  onCambiar,
}: {
  idPrefix: string
  items: FirmaItem[]
  valores: Record<string, boolean>
  onCambiar: (campo: string, valor: boolean) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {items.map((item) => {
        const id = `${idPrefix}-${item.campo}`
        return (
          <Field key={item.campo} orientation="horizontal">
            <Checkbox
              id={id}
              checked={valores[item.campo] ?? false}
              onCheckedChange={(valor) => onCambiar(item.campo, valor === true)}
            />
            <FieldLabel htmlFor={id}>{item.etiqueta}</FieldLabel>
          </Field>
        )
      })}
    </div>
  )
}
