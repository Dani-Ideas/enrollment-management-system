import { DrillMenu } from "@/components/ui/DrillMenu"
import { useSecciones } from "@/components/navegacion/useSecciones"
import { TableroSolicitudes } from "@/components/panel-solicitud/TableroSolicitudes"

export function SeccionPage({ seccionId }: { seccionId: string }) {
  const secciones = useSecciones()
  const seccion = secciones.find((s) => s.id === seccionId)

  if (seccion === undefined || seccion.submenu === undefined) return null

  return (
    <section className="w-full space-y-4">
      <header>
        <h2 className="text-seccion font-semibold tracking-titulo">{seccion.label}</h2>
        {seccion.descripcion !== undefined && (
          <p className="text-sm text-muted-foreground">{seccion.descripcion}</p>
        )}
      </header>

      {/* El submenu (DrillMenu, sin tocar) a la izquierda, y el tablero con datos reales
          ocupando el resto -- antes esta pagina era el DrillMenu solo en una pantalla vacia. */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-4">
          <DrillMenu items={seccion.submenu} />
        </div>
        <div className="xl:col-span-8">
          {seccionId === "solicitudes" && <TableroSolicitudes />}
        </div>
      </div>
    </section>
  )
}
