import { DrillMenu } from "@/components/ui/DrillMenu"
import { useSecciones } from "@/components/navegacion/useSecciones"

export function SeccionPage({ seccionId }: { seccionId: string }) {
  const secciones = useSecciones()
  const seccion = secciones.find((s) => s.id === seccionId)

  if (seccion === undefined || seccion.submenu === undefined) return null

  return (
    <section className="mb-12">
      <header className="mb-6">
        <h2 className="text-seccion font-semibold tracking-titulo">{seccion.label}</h2>
        {seccion.descripcion !== undefined && (
          <p className="text-sm text-muted-foreground">{seccion.descripcion}</p>
        )}
      </header>

      <DrillMenu items={seccion.submenu} />
    </section>
  )
}
