import { Field, FieldLabel } from "@/components/ui/field"
import { NativeSelect } from "@/components/ui/native-select"
import type { InscripcionFormApi } from "./useInscripcionForm"

interface CatalogoResponsable {
  data: { id: number; nombreLargo: string }[] | undefined
  isLoading: boolean
}

// Grupo de 3 <select> (Jefe de Carrera/Maestro/Carrera) -- las 3 usan el
// MISMO catalogo (responsablesQuery), solo cambia a que campo de "form"
// escribe cada uno. Usado tanto en el paso "Responsables" del flujo "crear"
// como en el paso "Editar campos" del flujo "actualizar".
export function CampoResponsables({
  form,
  idPrefix,
  responsablesQuery,
  mostrarPlaceholder = true,
}: {
  form: InscripcionFormApi["form"]
  idPrefix: string
  responsablesQuery: CatalogoResponsable
  mostrarPlaceholder?: boolean
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-resp-proyecto`}>Jefe de Carrera</FieldLabel>
        <form.Field name="jefeCarreraId">
          {(field) => (
            <NativeSelect
              id={`${idPrefix}-resp-proyecto`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              {mostrarPlaceholder && (
                <option value="">{responsablesQuery.isLoading ? "Cargando…" : "Seleccioná…"}</option>
              )}
              {responsablesQuery.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombreLargo}
                </option>
              ))}
            </NativeSelect>
          )}
        </form.Field>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-resp-desarrollo`}>Maestro</FieldLabel>
        <form.Field name="maestroId">
          {(field) => (
            <NativeSelect
              id={`${idPrefix}-resp-desarrollo`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              {mostrarPlaceholder && (
                <option value="">{responsablesQuery.isLoading ? "Cargando…" : "Seleccioná…"}</option>
              )}
              {responsablesQuery.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombreLargo}
                </option>
              ))}
            </NativeSelect>
          )}
        </form.Field>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-resp-inscripcion`}>Carrera</FieldLabel>
        <form.Field name="carreraId">
          {(field) => (
            <NativeSelect
              id={`${idPrefix}-resp-inscripcion`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
            >
              {mostrarPlaceholder && (
                <option value="">{responsablesQuery.isLoading ? "Cargando…" : "Seleccioná…"}</option>
              )}
              {responsablesQuery.data?.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nombreLargo}
                </option>
              ))}
            </NativeSelect>
          )}
        </form.Field>
      </Field>
    </div>
  )
}
