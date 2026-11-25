import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import type { InscripcionFormApi } from "./useInscripcionForm"

export function CampoDatosProyecto({
  form,
  idPrefix,
  mostrarEjemplos = true,
  disabled = false,
}: {
  form: InscripcionFormApi["form"]
  idPrefix: string
  mostrarEjemplos?: boolean
  disabled?: boolean
}) {
  return (
    <>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-proyecto`}>Proyecto</FieldLabel>
        <form.Field name="proyecto">
          {(field) => (
            <Input
              id={`${idPrefix}-proyecto`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={disabled}
              placeholder={mostrarEjemplos ? "Ej. Migración de facturación" : undefined}
              required
            />
          )}
        </form.Field>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-version`}>Versión</FieldLabel>
        <form.Field name="version">
          {(field) => (
            <Input
              id={`${idPrefix}-version`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={disabled}
              placeholder={mostrarEjemplos ? "Ej. 1.0.0" : undefined}
              required
            />
          )}
        </form.Field>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-fecha-planteada`}>Fecha planteada</FieldLabel>
        <form.Field name="fechaPlanteada">
          {(field) => (
            <Input
              id={`${idPrefix}-fecha-planteada`}
              type="datetime-local"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={disabled}
              required
            />
          )}
        </form.Field>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-fecha-real`}>Fecha real (opcional)</FieldLabel>
        <form.Field name="fechaReal">
          {(field) => (
            <Input
              id={`${idPrefix}-fecha-real`}
              type="datetime-local"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={disabled}
            />
          )}
        </form.Field>
      </Field>
      <Field>
        <FieldLabel htmlFor={`${idPrefix}-descripcion`}>Descripción</FieldLabel>
        <form.Field name="descripcion">
          {(field) => (
            <Textarea
              id={`${idPrefix}-descripcion`}
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              disabled={disabled}
              placeholder="Opcional…"
            />
          )}
        </form.Field>
      </Field>
    </>
  )
}
