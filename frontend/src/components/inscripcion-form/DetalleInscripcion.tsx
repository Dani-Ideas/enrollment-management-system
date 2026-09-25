import type { InscripcionDTO } from "@/api/types"

// <dl> de solo lectura con todos los campos de una Inscripcion -- usado en
// la confirmacion de "crear", la confirmacion de "actualizar", y "Ver
// detalle" en la lista (InscripcionWizard).
export function DetalleInscripcion({ inscripcion }: { inscripcion: InscripcionDTO }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
      <dt className="text-muted-foreground">Proyecto</dt>
      <dd>{inscripcion.proyecto}</dd>
      <dt className="text-muted-foreground">Versión</dt>
      <dd>{inscripcion.version}</dd>
      <dt className="text-muted-foreground">Estado</dt>
      <dd>{inscripcion.estado}</dd>
      <dt className="text-muted-foreground">Sistema</dt>
      <dd>{inscripcion.sistema}</dd>
      <dt className="text-muted-foreground">Ambiente</dt>
      <dd>{inscripcion.ambiente}</dd>
      <dt className="text-muted-foreground">Jefe de Carrera</dt>
      <dd>{inscripcion.jefeCarrera}</dd>
      <dt className="text-muted-foreground">Maestro</dt>
      <dd>{inscripcion.maestro}</dd>
      <dt className="text-muted-foreground">Carrera</dt>
      <dd>{inscripcion.carrera}</dd>
      <dt className="text-muted-foreground">Fecha planteada</dt>
      <dd>{inscripcion.fechaInscripcionPlanteada}</dd>
      {inscripcion.fechaInscripcionReal && (
        <>
          <dt className="text-muted-foreground">Fecha real</dt>
          <dd>{inscripcion.fechaInscripcionReal}</dd>
        </>
      )}
      {inscripcion.descripcion && (
        <>
          <dt className="text-muted-foreground">Descripción</dt>
          <dd>{inscripcion.descripcion}</dd>
        </>
      )}
    </dl>
  )
}
