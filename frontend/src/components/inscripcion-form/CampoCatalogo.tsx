import { Field, FieldLabel } from "@/components/ui/field"
import { NativeSelect } from "@/components/ui/native-select"
import type { InscripcionFormApi } from "./useInscripcionForm"

interface Catalogo {
  data: { id: number; estado?: string; nombre?: string }[] | undefined
  isLoading: boolean
}

// Grupo de 3 <select> (Estado/Sistema/Ambiente) ligados a "form" via
// form.Field -- usado tanto en el paso "Catálogo" del flujo "crear" como en
// el paso "Editar campos" del flujo "actualizar". mostrarPlaceholder=false
// en "actualizar" (el baseline ya trae un id valido cargado, no hace falta
// la opcion "Seleccioná...").
export function CampoCatalogo({
  form,
  idPrefix,
  estadosQuery,
  sistemasQuery,
  ambientesQuery,
  mostrarPlaceholder = true,
}: {
  form: InscripcionFormApi["form"]
  idPrefix: string
  estadosQuery: Catalogo
  sistemasQuery: Catalogo
  ambientesQuery: Catalogo
  mostrarPlaceholder?: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-estado`}>Estado</FieldLabel>
        <form.Field name="estadoId">
          {(field) => (
            <NativeSelect
              id={`${idPrefix}-estado`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              {mostrarPlaceholder && (
                <option value="">{estadosQuery.isLoading ? "Cargando…" : "Seleccioná un estado…"}</option>
              )}
              {estadosQuery.data?.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.estado}
                </option>
              ))}
            </NativeSelect>
          )}
        </form.Field>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-sistema`}>Sistema</FieldLabel>
        <form.Field name="sistemaId">
          {(field) => (
            <NativeSelect
              id={`${idPrefix}-sistema`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              {mostrarPlaceholder && (
                <option value="">{sistemasQuery.isLoading ? "Cargando…" : "Seleccioná un sistema…"}</option>
              )}
              {sistemasQuery.data?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre}
                </option>
              ))}
            </NativeSelect>
          )}
        </form.Field>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-ambiente`}>Ambiente</FieldLabel>
        <form.Field name="ambienteId">
          {(field) => (
            <NativeSelect
              id={`${idPrefix}-ambiente`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              {mostrarPlaceholder && (
                <option value="">{ambientesQuery.isLoading ? "Cargando…" : "Seleccioná un ambiente…"}</option>
              )}
              {ambientesQuery.data?.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre}
                </option>
              ))}
            </NativeSelect>
          )}
        </form.Field>
      </Field>
    </div>
  )
}
