import { ListPlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import type { FormacionComplementariaEditable } from "./types"

// Lista editable (agregar/quitar/editar texto) de formaciones
// complementarias -- misma UI para las dos situaciones donde aparece: las
// "nuevas" del flujo "crear" (formacionesNuevas, todo con id null porque la
// Inscripcion todavia no existe) y las "editables" del flujo "actualizar"
// (formacionesEditables, mezcla de filas con id real y filas recien
// agregadas). El diff contra lo que habia antes se resuelve en el hook, no
// aca -- este componente solo junta texto.
export function FormacionesComplementariasEditor({
  items,
  onAgregar,
  onCambiar,
  onQuitar,
  descripcionAyuda,
  cargando = false,
}: {
  items: FormacionComplementariaEditable[]
  onAgregar: () => void
  onCambiar: (indice: number, valor: string) => void
  onQuitar: (indice: number) => void
  descripcionAyuda: string
  cargando?: boolean
}) {
  return (
    <Field>
      <FieldLabel>Formaciones complementarias</FieldLabel>
      <FieldDescription>{descripcionAyuda}</FieldDescription>
      {cargando && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Cargando formaciones complementarias…
        </div>
      )}
      <div className="space-y-2">
        {items.map((item, indice) => (
          <div key={indice} className="flex gap-2">
            <Input
              value={item.descripcion}
              onChange={(e) => onCambiar(indice, e.target.value)}
              placeholder="Descripción de la formación complementaria"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => onQuitar(indice)}
              aria-label="Quitar formación complementaria"
            >
              <Trash2Icon />
            </Button>
          </div>
        ))}
      </div>
      <Button type="button" variant="outline" size="sm" onClick={onAgregar} className="w-fit">
        <ListPlusIcon />
        Agregar formación complementaria
      </Button>
    </Field>
  )
}
