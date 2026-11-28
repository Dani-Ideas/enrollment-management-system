import { useState } from "react"
import { ListPlusIcon, SaveIcon, Trash2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { NativeSelect } from "@/components/ui/native-select"
import { Spinner } from "@/components/ui/spinner"
import { checklistDesdePlantilla, type ChecklistItemEditable, type PlantillasChecklistApi } from "./types"

interface Catalogo {
  data: { id: number; estado?: string; nombre?: string }[] | undefined
  isLoading: boolean
}
interface CatalogoResponsable {
  data: { id: number; nombreLargo: string }[] | undefined
  isLoading: boolean
}

export function ChecklistEditor({
  items,
  onAgregar,
  onCambiar,
  onQuitar,
  estadosQuery,
  responsablesQuery,
  disabled = false,
  plantillas,
  onAgregarVarias,
  nivel,
}: {
  items: ChecklistItemEditable[]
  onAgregar: () => void
  onCambiar: (indice: number, campo: keyof ChecklistItemEditable, valor: string) => void
  onQuitar: (indice: number) => void
  estadosQuery: Catalogo
  responsablesQuery: CatalogoResponsable
  disabled?: boolean
  // Plantillas: opcionales a proposito -- sin estas props el editor es exactamente el de
  // antes (es lo que usan las vistas de solo lectura).
  plantillas?: PlantillasChecklistApi
  onAgregarVarias?: (filas: ChecklistItemEditable[]) => void
  // 1/2/3 = Primaria/Secundaria/Universidad. Es el ORDEN de la etapa, no su id: una
  // plantilla trae filas para los 3 niveles y hay que quedarse con las de este.
  nivel?: number
}) {
  // La clave de una plantilla es arquitectura + nombre, no el nombre solo: dos
  // arquitecturas pueden tener una "Basica" distinta.
  const [plantillaElegida, setPlantillaElegida] = useState("")
  const [nombreNuevo, setNombreNuevo] = useState("")
  const [arquitecturaNueva, setArquitecturaNueva] = useState("")

  const ofrecePlantillas =
    !disabled && plantillas !== undefined && onAgregarVarias !== undefined && nivel !== undefined

  function claveDe(p: { tipoArquitecturaId: number; nombre: string }) {
    return `${p.tipoArquitecturaId}|${p.nombre}`
  }

  const plantilla = plantillas?.query.data?.find((p) => claveDe(p) === plantillaElegida)
  const filasDelNivel = plantilla === undefined || nivel === undefined
    ? []
    : plantilla.filas.filter((f) => f.etapaOrden === nivel)

  // Aplicar = copiar las filas al final de lo que ya hay. Nunca reemplaza ni pisa nada, y
  // se pueden aplicar dos plantillas seguidas.
  function aplicarPlantilla() {
    if (plantilla === undefined || onAgregarVarias === undefined || nivel === undefined) return
    onAgregarVarias(checklistDesdePlantilla(plantilla.filas, nivel))
    setPlantillaElegida("")
  }

  return (
    <div className="space-y-3">
      {ofrecePlantillas && (
        <div className="space-y-2 rounded-md border border-dashed p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field>
              <FieldLabel>Plantilla</FieldLabel>
              <div className="flex gap-2">
                <NativeSelect
                  value={plantillaElegida}
                  onChange={(e) => setPlantillaElegida(e.target.value)}
                  className="min-w-0 flex-1"
                >
                  <option value="">{plantillas!.query.isLoading ? "Cargando…" : "Seleccioná…"}</option>
                  {plantillas!.query.data?.map((p) => (
                    <option key={claveDe(p)} value={claveDe(p)}>
                      {p.nombre} · {p.tipoArquitectura} ({p.filas.filter((f) => f.etapaOrden === nivel).length})
                    </option>
                  ))}
                </NativeSelect>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={aplicarPlantilla}
                  disabled={plantillaElegida === "" || filasDelNivel.length === 0}
                  className="w-fit shrink-0"
                >
                  <ListPlusIcon />
                  Agregar filas
                </Button>
              </div>
            </Field>
            <Field>
              <FieldLabel>Guardar estas filas como plantilla</FieldLabel>
              <div className="flex gap-2">
                <Input
                  value={nombreNuevo}
                  onChange={(e) => setNombreNuevo(e.target.value)}
                  placeholder="Nombre de la plantilla"
                  className="min-w-0 flex-1"
                />
                <NativeSelect
                  value={arquitecturaNueva}
                  onChange={(e) => setArquitecturaNueva(e.target.value)}
                  className="min-w-0 flex-1"
                >
                  <option value="">Arquitectura…</option>
                  {plantillas!.arquitecturas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.nombre}
                    </option>
                  ))}
                </NativeSelect>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => plantillas!.guardar(nombreNuevo, arquitecturaNueva, items, nivel!)}
                  disabled={
                    nombreNuevo.trim() === "" ||
                    arquitecturaNueva === "" ||
                    items.length === 0 ||
                    plantillas!.guardando
                  }
                  className="w-fit shrink-0"
                >
                  {plantillas!.guardando && <Spinner />}
                  <SaveIcon />
                  Guardar
                </Button>
              </div>
            </Field>
          </div>
          {plantillaElegida !== "" && filasDelNivel.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Esa plantilla no trae filas para este nivel de la cadena.
            </p>
          )}
          {plantillas!.error !== null && <p className="text-sm text-destructive">{plantillas!.error}</p>}
          {plantillas!.error === null && plantillas!.guardada !== null && (
            <p className="text-sm text-muted-foreground">Plantilla «{plantillas!.guardada}» guardada.</p>
          )}
        </div>
      )}
      {items.map((item, indice) => (
        <div key={indice} className="space-y-2 rounded-md border p-3">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <Field>
              <FieldLabel>Sección</FieldLabel>
              <Input
                value={item.seccion}
                onChange={(e) => onCambiar(indice, "seccion", e.target.value)}
                disabled={disabled}
              />
            </Field>
            <Field>
              <FieldLabel>Actividad</FieldLabel>
              <Input
                value={item.actividad}
                onChange={(e) => onCambiar(indice, "actividad", e.target.value)}
                disabled={disabled}
              />
            </Field>
            <Field>
              <FieldLabel>Descripción</FieldLabel>
              <Input
                value={item.descripcion}
                onChange={(e) => onCambiar(indice, "descripcion", e.target.value)}
                disabled={disabled}
              />
            </Field>
            <Field>
              <FieldLabel>Conexión</FieldLabel>
              <Input
                value={item.conexion}
                onChange={(e) => onCambiar(indice, "conexion", e.target.value)}
                disabled={disabled}
              />
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
              <FieldLabel>Responsable</FieldLabel>
              <NativeSelect
                value={item.responsableId}
                onChange={(e) => onCambiar(indice, "responsableId", e.target.value)}
                disabled={disabled}
              >
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
            <Input
              value={item.comentario}
              onChange={(e) => onCambiar(indice, "comentario", e.target.value)}
              disabled={disabled}
            />
          </Field>
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
          Agregar fila de checklist
        </Button>
      )}
      {disabled && items.length === 0 && (
        <p className="text-sm text-muted-foreground">Sin filas de checklist.</p>
      )}
    </div>
  )
}
