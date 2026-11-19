import { ListPlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import type { ChecklistItemEditable } from "./types"

interface Catalogo {
  data: { id: number; estado?: string; nombre?: string }[] | undefined
  isLoading: boolean
}
interface CatalogoResponsable {
  data: { id: number; nombreLargo: string }[] | undefined
  isLoading: boolean
}

// Lista editable (agregar/quitar/editar) de filas de checklist -- reemplaza al viejo
// checklist fijo de firmas booleanas (CampoFirmas): cada fila es una actividad con su propio
// estado/responsable, no un checkbox con nombre fijo. Mismo patron add/remove que
// FormacionesComplementariasEditor.
export function ChecklistEditor({
  items,
  onAgregar,
  onCambiar,
  onQuitar,
  estadosQuery,
  responsablesQuery,
}: {
  items: ChecklistItemEditable[]
  onAgregar: () => void
  onCambiar: (indice: number, campo: keyof ChecklistItemEditable, valor: string) => void
  onQuitar: (indice: number) => void
  estadosQuery: Catalogo
  responsablesQuery: CatalogoResponsable
}) {
  return (
    <div className="space-y-3">
      {items.map((item, indice) => (
        <div key={indice} className="space-y-2 rounded-md border p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field>
              <FieldLabel>Sección</FieldLabel>
              <Input value={item.seccion} onChange={(e) => onCambiar(indice, "seccion", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Actividad</FieldLabel>
              <Input value={item.actividad} onChange={(e) => onCambiar(indice, "actividad", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Descripción</FieldLabel>
              <Input value={item.descripcion} onChange={(e) => onCambiar(indice, "descripcion", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Conexión</FieldLabel>
              <Input value={item.conexion} onChange={(e) => onCambiar(indice, "conexion", e.target.value)} />
            </Field>
            <Field>
              <FieldLabel>Estado</FieldLabel>
              <NativeSelect value={item.estadoId} onChange={(e) => onCambiar(indice, "estadoId", e.target.value)}>
                <option value="">{estadosQuery.isLoading ? "Cargando…" : "Seleccioná…"}</option>
                {estadosQuery.data?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.estado}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel>Responsable</FieldLabel>
              <NativeSelect value={item.responsableId} onChange={(e) => onCambiar(indice, "responsableId", e.target.value)}>
                <option value="">{responsablesQuery.isLoading ? "Cargando…" : "Seleccioná…"}</option>
                {responsablesQuery.data?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.nombreLargo}
                  </option>
                ))}
              </NativeSelect>
            </Field>
          </div>
          <Field>
            <FieldLabel>Comentario (opcional)</FieldLabel>
            <Input value={item.comentario} onChange={(e) => onCambiar(indice, "comentario", e.target.value)} />
          </Field>
          <Button type="button" variant="outline" size="sm" onClick={() => onQuitar(indice)}>
            <Trash2Icon />
            Quitar fila
          </Button>
        </div>
      ))}
      <Button type="button" variant="outline" size="sm" onClick={onAgregar} className="w-fit">
        <ListPlusIcon />
        Agregar fila de checklist
      </Button>
    </div>
  )
}
