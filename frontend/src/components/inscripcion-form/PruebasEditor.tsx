import { ListPlusIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import type { PruebaItemEditable } from "./types"

interface Catalogo {
  data: { id: number; estado?: string; nombre?: string }[] | undefined
  isLoading: boolean
}

export function PruebasEditor({
  items,
  onAgregar,
  onCambiar,
  onQuitar,
  estadosQuery,
  tiposPruebaQuery,
  disabled = false,
}: {
  items: PruebaItemEditable[]
  onAgregar: () => void
  onCambiar: (indice: number, campo: keyof PruebaItemEditable, valor: string) => void
  onQuitar: (indice: number) => void
  estadosQuery: Catalogo
  tiposPruebaQuery: Catalogo
  disabled?: boolean
}) {
  return (
    <div className="space-y-3">
      {items.map((item, indice) => (
        <div key={indice} className="space-y-2 rounded-md border p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field>
              <FieldLabel>Tipo de prueba</FieldLabel>
              <NativeSelect
                value={item.tipoPruebaId}
                onChange={(e) => onCambiar(indice, "tipoPruebaId", e.target.value)}
                disabled={disabled}
              >
                <option value="">{tiposPruebaQuery.isLoading ? "Cargando…" : "Seleccioná…"}</option>
                {tiposPruebaQuery.data?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel>Estado</FieldLabel>
              <NativeSelect
                value={item.estadoId}
                onChange={(e) => onCambiar(indice, "estadoId", e.target.value)}
                disabled={disabled}
              >
                <option value="">{estadosQuery.isLoading ? "Cargando…" : "Seleccioná…"}</option>
                {estadosQuery.data?.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.estado}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field>
              <FieldLabel>Ruta</FieldLabel>
              <Input value={item.ruta} onChange={(e) => onCambiar(indice, "ruta", e.target.value)} disabled={disabled} />
            </Field>
            <Field>
              <FieldLabel>Alcance</FieldLabel>
              <Input
                value={item.alcance}
                onChange={(e) => onCambiar(indice, "alcance", e.target.value)}
                disabled={disabled}
              />
            </Field>
            <Field>
              <FieldLabel>Resultado</FieldLabel>
              <Input
                value={item.resultado}
                onChange={(e) => onCambiar(indice, "resultado", e.target.value)}
                disabled={disabled}
              />
            </Field>
            <Field>
              <FieldLabel>Comentario</FieldLabel>
              <Input
                value={item.comentario}
                onChange={(e) => onCambiar(indice, "comentario", e.target.value)}
                disabled={disabled}
              />
            </Field>
          </div>
          {!disabled && (
            <Button type="button" variant="outline" size="sm" onClick={() => onQuitar(indice)}>
              <Trash2Icon />
              Quitar fila
            </Button>
          )}
        </div>
      ))}
      {!disabled && (
        <Button type="button" variant="outline" size="sm" onClick={onAgregar} className="w-fit">
          <ListPlusIcon />
          Agregar prueba
        </Button>
      )}
      {disabled && items.length === 0 && <p className="text-sm text-muted-foreground">Sin pruebas registradas.</p>}
    </div>
  )
}
