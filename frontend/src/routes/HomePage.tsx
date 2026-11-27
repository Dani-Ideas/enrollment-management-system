import { DrillMenu, type DrillMenuItem } from "@/components/ui/DrillMenu"
import { useSecciones } from "@/components/navegacion/useSecciones"

export function HomePage() {
  const secciones = useSecciones()

  const items: DrillMenuItem[] = secciones.map((seccion) => ({
    to: seccion.to,
    label: seccion.label,
    descripcion: seccion.descripcion,
    icon: seccion.icon,
    submenu: seccion.submenu,
  }))

  return (
    <section className="mb-12">
      <DrillMenu items={items} />
    </section>
  )
}
