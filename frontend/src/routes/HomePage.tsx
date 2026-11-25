import { useQuery } from "@tanstack/react-query"
import { Building2Icon, FileTextIcon, ListIcon, LogOutIcon, PencilIcon, PlusIcon } from "lucide-react"
import { CATALOGOS_INSCRIPCION_QUERY } from "@/api/client"
import { DrillMenu, type DrillMenuItem } from "../components/ui/DrillMenu"

export function HomePage() {
  const catalogosQuery = useQuery(CATALOGOS_INSCRIPCION_QUERY)
  const ambientes = catalogosQuery.data?.ambientes ?? []

  function itemConAmbientes(accion: "crear" | "actualizar", label: string, icon: DrillMenuItem["icon"]): DrillMenuItem {
    if (ambientes.length === 0) {
      return { to: "/formulario-pago", search: { accion }, label, icon }
    }
    return {
      to: "/formulario-pago",
      label,
      icon,
      submenu: ambientes.map((a) => ({
        to: "/formulario-pago",
        search: { accion, ambiente: String(a.id) },
        label: a.nombre,
        icon: Building2Icon,
      })),
    }
  }

  return (
    <>
      <section className="mb-12">
        <DrillMenu
          items={[
            {
              to: "/salir-sitio",
              label: "Para Docente",
              descripcion: "Sitio para los maestros.",
              icon: LogOutIcon,
            },
            {
              to: "/formulario-pago",
              label: "Solicitudes",
              descripcion: "Registro, edicion, conulta de solicitudes.",
              icon: FileTextIcon,
              submenu: [
                {
                  to: "/formulario-pago",
                  search: { accion: "consultar" },
                  label: "Inscripciones",
                  icon: ListIcon,
                },
                itemConAmbientes("crear", "Crear una solicitud nueva", PlusIcon),
                itemConAmbientes("actualizar", "Actualizar una solicitud existente", PencilIcon),
              ],
            },
          ]}
        />
      </section>
    </>
  )
}
